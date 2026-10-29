import { AxiosError, AxiosResponse } from "axios"
import { ReactNode, useEffect, useState } from "react"

import { AskResponse } from "../../api/chatbot/Responses"
import { ChatbotAPI } from "../../api/chatbot/ChatbotAPI"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"

// Matches ChatbotInteraction.MAX_QUESTION_LENGTH on the backend
export const MAX_QUESTION_LENGTH = 1000

const RESPONSE_TIME = "Our team typically responds within 24 hours during operating hours."

type Step =
	| { kind: "loading" }
	| { kind: "form"; notice?: string; question?: string }
	| { kind: "ask" }
	| { kind: "thinking" }
	| { kind: "answered"; interactionID: number; answer: string }
	| { kind: "sentToStaff"; botCouldNotAnswer: boolean }

/**
 * Answers an adopter's question from the shelter's policies before it reaches staff. Adopters without the
 * chatbot flag, or past the daily question cap, get the regular Message Adoptions form instead.
 */
export function AskAdoptions({
	adopterID,
	messageForm,
	onDone,
}: {
	adopterID: number
	// Renders the regular form, pre-filled with the adopter's question when they already typed one
	messageForm: (initialValue?: string) => ReactNode
	onDone: () => void
}) {
	const [step, setStep] = useState<Step>({ kind: "loading" })
	const [question, setQuestion] = useState("")
	const [questionsRemaining, setQuestionsRemaining] = useState(0)

	useEffect(() => {
		new ChatbotAPI()
			.GetStatus(adopterID)
			.then((resp) => {
				if (!resp?.enabled) {
					setStep({ kind: "form" })
				} else if (resp.questionsRemaining < 1) {
					setStep({ kind: "form", notice: LIMIT_NOTICE })
				} else {
					setQuestionsRemaining(resp.questionsRemaining)
					setStep({ kind: "ask" })
				}
			})
			.catch(() => setStep({ kind: "form" }))
	}, [adopterID])

	const ask = async () => {
		const trimmed = question.trim()
		if (!trimmed) return

		setStep({ kind: "thinking" })
		const resp = await new ChatbotAPI().Ask({ adopterID, question: trimmed })

		if (resp?.status === 200) {
			const data: AskResponse = resp.data
			setQuestionsRemaining(data.questionsRemaining)
			setStep(
				data.answered ? { answer: data.answer, interactionID: data.interactionID, kind: "answered" } : { botCouldNotAnswer: true, kind: "sentToStaff" }
			)
			return
		}

		// Failed requests come back as the axios error rather than a response
		const status = (resp as unknown as AxiosError | undefined)?.response?.status
		setStep({
			kind: "form",
			notice: status === 429 ? LIMIT_NOTICE : "Sorry, we couldn't look that up. Please send your question to our team below.",
			question: trimmed,
		})
	}

	const sendToStaff = async (interactionID: number) => {
		const resp: AxiosResponse | undefined = await new ChatbotAPI().SendToStaff(interactionID)
		if (resp?.status === 204) {
			setStep({ botCouldNotAnswer: false, kind: "sentToStaff" })
		} else {
			showToast({ level: MessageLevel.Error, message: "Failed to send! Please try again." })
		}
	}

	const askAnother = () => {
		setQuestion("")
		setStep({ kind: "ask" })
	}

	switch (step.kind) {
		// Show the regular form while loading so adopters without the chatbot see no change
		case "loading":
			return messageForm()

		case "form":
			return (
				<div className="flex flex-col gap-y-3">
					{step.notice && <Message level={MessageLevel.Warning} message={step.notice} />}
					{messageForm(step.question ? toMessageHTML(step.question) : undefined)}
				</div>
			)

		case "ask":
			return (
				<div className="flex flex-col gap-y-2 text-left">
					<p className="text-lg">
						Type your question below to get an answer right away from our adoption policies. If we don&apos;t have an answer, we&apos;ll send your question
						to our team.
					</p>
					<TextInput
						addlProps={{ minRows: 3, multiline: true, slotProps: { htmlInput: { maxLength: MAX_QUESTION_LENGTH } } }}
						errors={[]}
						fieldLabel="Your question"
						value={question}
						onChange={setQuestion}
					/>
					<p className="text-sm text-gray-500">
						You can ask {questionsRemaining} more {questionsRemaining === 1 ? "question" : "questions"} today.
					</p>
					<LargeButton label="Ask" onClick={ask} />
					<TextButton label="Skip this and write to our team" onClick={() => setStep({ kind: "form", question: question.trim() || undefined })} />
				</div>
			)

		case "thinking":
			return <Message level={MessageLevel.Default} message="Looking that up for you. This can take up to 30 seconds..." />

		case "answered":
			return (
				<div className="flex flex-col gap-y-2 text-left">
					<div className="rounded border-2 border-pink-700 bg-pink-50 p-3">
						<div className="text-sm font-semibold text-pink-800 uppercase">Automated answer</div>
						<p className="text-lg whitespace-pre-line">{step.answer}</p>
					</div>
					<p className="text-sm text-gray-500">
						This answer comes from our adoption policies. If it doesn&apos;t answer your question, a person on our team can help.
					</p>
					<LargeButton label="That answers my question" onClick={onDone} />
					<LargeButton label="I still need help" onClick={() => sendToStaff(step.interactionID)} />
					{questionsRemaining > 0 && <TextButton label="Ask another question" onClick={askAnother} />}
				</div>
			)

		case "sentToStaff":
			return (
				<div className="flex flex-col gap-y-2">
					<Message
						level={MessageLevel.Success}
						message={
							(step.botCouldNotAnswer
								? "We don't have an automatic answer for that, so we've sent your question to our team. "
								: "We've sent your question to our team. ") + RESPONSE_TIME
						}
					/>
					<LargeButton label="Close" onClick={onDone} />
				</div>
			)
	}
}

const LIMIT_NOTICE = "You've reached today's limit for instant answers. Please send your question to our team below."

function TextButton({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button className="m-auto mt-1 block text-pink-700 underline hover:cursor-pointer" type="button" onClick={onClick}>
			{label}
		</button>
	)
}

function toMessageHTML(text: string) {
	const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
	return escaped
		.split("\n")
		.map((line) => `<p>${line || "<br>"}</p>`)
		.join("")
}
