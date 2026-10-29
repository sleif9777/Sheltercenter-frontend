export type ChatbotStatusResponse = {
	enabled: boolean
	// null when there's no daily cap
	questionsRemaining: number | null
}

export type AskResponse = {
	interactionID: number
	// false means the question was sent to staff instead
	answered: boolean
	answer: string
	// null when there's no daily cap
	questionsRemaining: number | null
}
