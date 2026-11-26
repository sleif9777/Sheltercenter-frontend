export type ChatbotStatusResponse = {
	enabled: boolean
	// null when there's no daily cap
	questionsRemaining: number | null
}

export type AskResponse = {
	interactionID: number
	// What to show the adopter; empty when the chatbot couldn't answer any of the message
	answer: string
	// The chatbot already emailed the message to staff, alone or alongside a partial answer
	sentToStaff: boolean
	// Slugs of the policies the answer relied on; empty when there's no answer
	citedPolicies: string[]
	// An open time the adopter can move their appointment to with one click
	offer: { label: string } | null
	// The adopter's current appointment, when the chatbot offered to cancel it
	offerCancel: { label: string } | null
	// The answer asks for one more detail, which the adopter can reply with in place
	awaitingReply: boolean
	// The adopter said they're bringing their own dog, so they're now marked as bringing it
	markedBringingDog: boolean
	// null when there's no daily cap
	questionsRemaining: number | null
}

export type AcceptOfferResponse = {
	// The appointment's new time, e.g. "Wednesday, October 28 at 4:30 PM"
	label: string
}
