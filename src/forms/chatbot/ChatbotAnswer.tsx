import { useState } from "react"

/**
 * Shown in place of the Message Adoptions form when the chatbot answered the adopter's message from the
 * shelter's policies. The adopter either accepts the answer or sends their message on to staff.
 */
export function ChatbotAnswer({ answer, onAccept, onSendToStaff }: { answer: string; onAccept: () => void; onSendToStaff: () => Promise<void> }) {
	const [sending, setSending] = useState(false)

	const sendToStaff = async () => {
		setSending(true)
		try {
			await onSendToStaff()
		} finally {
			setSending(false)
		}
	}

	return (
		<div className="flex flex-col gap-y-3 text-left">
			<div className="text-lg">Here&apos;s an answer from our adoption policies:</div>
			<div className="rounded border-2 border-pink-700 bg-pink-50 p-3 text-lg whitespace-pre-line">{answer}</div>
			<div className="text-sm text-gray-500">This is an automated answer. If it doesn&apos;t help, we&apos;ll send your message to our team.</div>
			<div className="flex flex-row flex-wrap justify-center gap-3">
				<AnswerButton label="That answers my question" onClick={onAccept} />
				<AnswerButton disabled={sending} label={sending ? "Sending..." : "Send my message to the team"} onClick={sendToStaff} />
			</div>
		</div>
	)
}

function AnswerButton({ disabled, label, onClick }: { disabled?: boolean; label: string; onClick: () => void }) {
	return (
		<button
			className="rounded-lg border-2 border-gray-700 bg-gray-100 px-3 py-1 uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
			disabled={disabled}
			type="button"
			onClick={onClick}
		>
			{label}
		</button>
	)
}
