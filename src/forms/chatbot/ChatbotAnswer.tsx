import { ReactNode, useState } from "react"

import { MAX_QUESTION_LENGTH } from "../../api/chatbot/Requests"
import { TextInput } from "../../core/components/formInputs/TextInput"

/**
 * Shown in place of the Message Adoptions form when the chatbot answered the adopter's message from the
 * shelter's policies:
 * - an offer to move or cancel their appointment: they confirm it or say never mind;
 * - a follow-up question: they reply in place, and the chatbot answers again;
 * - a partial answer: the message has already gone to staff, so they just read it and close;
 * - a full answer: they accept it or send their message on to staff.
 */
export function ChatbotAnswer({
	answer,
	awaitingReply,
	offer,
	offerCancel,
	sentToStaff,
	onAccept,
	onAcceptCancellation,
	onAcceptOffer,
	onReply,
	onSendToStaff,
}: {
	answer: string
	awaitingReply?: boolean
	// The open time the chatbot offered to move the appointment to
	offer?: string
	// The appointment the chatbot offered to cancel
	offerCancel?: string
	sentToStaff: boolean
	onAccept: () => void
	// Resolves to true once the appointment is canceled
	onAcceptCancellation?: () => Promise<boolean>
	// Resolves to the appointment's new time, or null if the time is no longer open
	onAcceptOffer?: () => Promise<string | null>
	onReply?: (reply: string) => Promise<void>
	onSendToStaff: () => Promise<void>
}) {
	const [busy, setBusy] = useState<"moving" | "canceling" | "replying" | "sending" | null>(null)
	const [done, setDone] = useState<ReactNode>(null)
	const [reply, setReply] = useState("")

	const run = async (kind: NonNullable<typeof busy>, action: () => Promise<void>) => {
		setBusy(kind)
		try {
			await action()
		} finally {
			setBusy(null)
		}
	}

	const acceptOffer = () =>
		run("moving", async () => {
			const movedTo = await onAcceptOffer?.()
			if (movedTo) {
				setDone(
					<>
						All set! Your appointment is now <span className="font-semibold">{movedTo}</span>. We&apos;ve emailed you a confirmation.
					</>
				)
			}
		})

	const acceptCancellation = () =>
		run("canceling", async () => {
			if (await onAcceptCancellation?.()) {
				setDone(
					<>
						Your appointment on <span className="font-semibold">{offerCancel}</span> is canceled. We&apos;ve emailed you a confirmation.
					</>
				)
			}
		})

	if (done) {
		return (
			<div className="flex flex-col gap-y-3 text-left">
				<div className="rounded border-2 border-green-600 bg-green-50 p-3 text-lg">{done}</div>
				<Buttons>
					<AnswerButton label="Close" onClick={onAccept} />
				</Buttons>
			</div>
		)
	}

	const answerBox = <div className="rounded border-2 border-pink-700 bg-pink-50 p-3 text-lg whitespace-pre-line">{withLinks(answer)}</div>
	const hasOffer = !sentToStaff && ((offer && onAcceptOffer) || (offerCancel && onAcceptCancellation))

	if (hasOffer) {
		return (
			<div className="flex flex-col gap-y-3 text-left">
				{answerBox}
				<Buttons>
					{offer && onAcceptOffer && (
						<AnswerButton
							disabled={!!busy}
							label={busy === "moving" ? "Rescheduling..." : "Yes, reschedule my appointment"}
							primary
							onClick={acceptOffer}
						/>
					)}
					{offerCancel && onAcceptCancellation && (
						<AnswerButton
							disabled={!!busy}
							label={busy === "canceling" ? "Canceling..." : "Yes, cancel my appointment"}
							primary
							onClick={acceptCancellation}
						/>
					)}
					<AnswerButton disabled={!!busy} label="Never Mind" onClick={onAccept} />
				</Buttons>
			</div>
		)
	}

	if (awaitingReply && onReply && !sentToStaff) {
		return (
			<div className="flex flex-col gap-y-3 text-left">
				{answerBox}
				<TextInput
					addlProps={{ disabled: !!busy, minRows: 2, multiline: true, slotProps: { htmlInput: { maxLength: MAX_QUESTION_LENGTH } } }}
					errors={[]}
					fieldLabel="Your reply"
					value={reply}
					onChange={setReply}
				/>
				<Buttons>
					<AnswerButton
						disabled={!!busy || !reply.trim()}
						label={busy === "replying" ? "Sending..." : "Send reply"}
						primary
						onClick={() => run("replying", () => onReply(reply.trim()))}
					/>
					<AnswerButton disabled={!!busy} label="Send my message to the team" onClick={() => run("sending", onSendToStaff)} />
				</Buttons>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-y-3 text-left">
			<div className="text-lg">{sentToStaff ? "Here's what our adoption policies say:" : "Here's an answer from our adoption policies:"}</div>
			{answerBox}
			{sentToStaff ? (
				<>
					<div className="text-lg">
						We&apos;ve also sent your message to our team, and they&apos;ll follow up on the rest. Our team typically responds within 24 hours during
						operating hours.
					</div>
					<Buttons>
						<AnswerButton label="Close" onClick={onAccept} />
					</Buttons>
				</>
			) : (
				<>
					<div className="text-sm text-gray-500">This is an automated answer. If it doesn&apos;t help, we&apos;ll send your message to our team.</div>
					<Buttons>
						<AnswerButton label="That answers my question" onClick={onAccept} />
						<AnswerButton
							disabled={!!busy}
							label={busy === "sending" ? "Sending..." : "Send my message to the team"}
							onClick={() => run("sending", onSendToStaff)}
						/>
					</Buttons>
				</>
			)}
		</div>
	)
}

function Buttons({ children }: { children: ReactNode }) {
	return <div className="flex flex-row flex-wrap justify-center gap-3">{children}</div>
}

function AnswerButton({ disabled, label, primary, onClick }: { disabled?: boolean; label: string; primary?: boolean; onClick: () => void }) {
	return (
		<button
			className={
				"rounded-lg border-2 px-3 py-1 uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 " +
				(primary ? "border-pink-700 bg-pink-200 font-semibold text-pink-800" : "border-gray-700 bg-gray-100")
			}
			disabled={disabled}
			type="button"
			onClick={onClick}
		>
			{label}
		</button>
	)
}

// The backend only lets through links copied from a policy, written as [text](/path/). Only pages on this site
// become links, opened in a new tab so the message form stays open.
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

function withLinks(answer: string): ReactNode[] {
	const parts: ReactNode[] = []
	let last = 0
	for (const match of answer.matchAll(LINK)) {
		const [whole, text, url] = match
		parts.push(answer.slice(last, match.index))
		const isSitePage = url.startsWith("/") && !url.startsWith("//")
		parts.push(
			isSitePage ? (
				<a className="font-semibold text-pink-700 underline" href={url} key={match.index} rel="noreferrer" target="_blank">
					{text}
				</a>
			) : (
				text
			)
		)
		last = match.index + whole.length
	}
	parts.push(answer.slice(last))
	return parts
}
