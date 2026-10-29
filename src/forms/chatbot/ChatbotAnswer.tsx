import { ReactNode, useState } from "react"

/**
 * Shown in place of the Message Adoptions form when the chatbot answered the adopter's message from the
 * shelter's policies. After a full answer the adopter either accepts it or sends their message on to staff.
 * After a partial answer the message has already gone to staff, so the adopter just reads it and closes.
 * A full answer can come with an open time; the appointment only moves if the adopter presses its button.
 */
export function ChatbotAnswer({
	answer,
	offer,
	sentToStaff,
	onAccept,
	onAcceptOffer,
	onSendToStaff,
}: {
	answer: string
	offer?: string
	sentToStaff: boolean
	onAccept: () => void
	// Resolves to the appointment's new time, or null if the time is no longer open
	onAcceptOffer?: () => Promise<string | null>
	onSendToStaff: () => Promise<void>
}) {
	const [sending, setSending] = useState(false)
	const [moving, setMoving] = useState(false)
	const [movedTo, setMovedTo] = useState<string | null>(null)

	const acceptOffer = async () => {
		setMoving(true)
		try {
			setMovedTo((await onAcceptOffer?.()) ?? null)
		} finally {
			setMoving(false)
		}
	}

	if (movedTo) {
		return (
			<div className="flex flex-col gap-y-3 text-left">
				<div className="rounded border-2 border-green-600 bg-green-50 p-3 text-lg">
					All set! Your appointment is now <span className="font-semibold">{movedTo}</span>. We&apos;ve emailed you a confirmation.
				</div>
				<div className="flex flex-row flex-wrap justify-center gap-3">
					<AnswerButton label="Close" onClick={onAccept} />
				</div>
			</div>
		)
	}

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
			<div className="text-lg">{sentToStaff ? "Here's what our adoption policies say:" : "Here's an answer from our adoption policies:"}</div>
			<div className="rounded border-2 border-pink-700 bg-pink-50 p-3 text-lg whitespace-pre-line">{withLinks(answer)}</div>
			{sentToStaff ? (
				<>
					<div className="text-lg">
						We&apos;ve also sent your message to our team, and they&apos;ll follow up on the rest. Our team typically responds within 24 hours during
						operating hours.
					</div>
					<div className="flex flex-row flex-wrap justify-center gap-3">
						<AnswerButton label="Close" onClick={onAccept} />
					</div>
				</>
			) : (
				<>
					<div className="text-sm text-gray-500">This is an automated answer. If it doesn&apos;t help, we&apos;ll send your message to our team.</div>
					<div className="flex flex-row flex-wrap justify-center gap-3">
						{offer && onAcceptOffer && (
							<AnswerButton disabled={moving} label={moving ? "Moving..." : `Move my appointment to ${offer}`} primary onClick={acceptOffer} />
						)}
						<AnswerButton label="That answers my question" onClick={onAccept} />
						<AnswerButton disabled={sending} label={sending ? "Sending..." : "Send my message to the team"} onClick={sendToStaff} />
					</div>
				</>
			)}
		</div>
	)
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
