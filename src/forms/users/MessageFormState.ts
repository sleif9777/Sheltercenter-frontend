import { SendMessageRequest } from "../../api/adopters/Requests"
import { deltaToPlainText } from "../../utils/QuillUtils"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type MessageAdopterFormFieldUpdater = FormFieldUpdateCallback<SendMessageRequest>

const initialState: SendMessageRequest = {
	adopterID: 0,
	message: "",
	subject: "",
}

export const useMessageFormState = createFormState<SendMessageRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must have a valid adopter selected"],
	message: [
		(s) => deltaToPlainText(s.message).trim().length > 0 || "Message cannot be blank",
		(s) => !s.message.toString().includes("$$$") || "Resolve all missing fill-in-the-blanks ($$$)",
	],
})
