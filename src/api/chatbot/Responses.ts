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
	// null when there's no daily cap
	questionsRemaining: number | null
}
