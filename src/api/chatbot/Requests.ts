export type AskRequest = {
	adopterID: number
	question: string
}

export type InteractionIDRequest = {
	interactionID: number
}

// Matches ChatbotInteraction.MAX_QUESTION_LENGTH on the backend; longer messages go straight to staff
export const MAX_QUESTION_LENGTH = 1000
