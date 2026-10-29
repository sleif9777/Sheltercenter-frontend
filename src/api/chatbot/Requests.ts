export type AskRequest = {
	adopterID: number
	// Plain text for the chatbot
	question: string
	// The message as written in the editor, so the email to staff keeps its formatting
	message?: string
}

export type InteractionIDRequest = {
	interactionID: number
}

// Matches ChatbotInteraction.MAX_QUESTION_LENGTH on the backend; longer messages go straight to staff
export const MAX_QUESTION_LENGTH = 1000
