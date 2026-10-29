import { SendMessageRequest } from "../../api/adopters/Requests"
import { deltaToPlainText } from "../../utils/QuillUtils"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type MessageAdopterFormFieldUpdater = FormFieldUpdateCallback<SendMessageRequest>

// templateFlag is listed so reset() clears a template chosen the last time the form was open
const initialState: SendMessageRequest = {
	adopterID: 0,
	message: "",
	subject: "",
	templateFlag: undefined,
}

export const useMessageFormState = createFormState<SendMessageRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must have a valid adopter selected"],
	message: [
		(s) => deltaToPlainText(s.message).trim().length > 0 || "Message cannot be blank",
		(s) => !s.message.toString().includes("$$$") || "Resolve all missing fill-in-the-blanks ($$$)",
	],
})
