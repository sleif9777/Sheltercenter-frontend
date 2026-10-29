export type ChatbotStatusResponse = {
	enabled: boolean
	questionsRemaining: number
}

export type AskResponse = {
	interactionID: number
	// false means the question was sent to staff instead
	answered: boolean
	answer: string
	questionsRemaining: number
}
