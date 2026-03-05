import * as EmailValidator from "email-validator"

import { UpdatePrimaryEmailRequest } from "../../api/users/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type UpdatePrimaryEmailFormFieldUpdater = FormFieldUpdateCallback<UpdatePrimaryEmailRequest>

const initialState: UpdatePrimaryEmailRequest = {
	newEmail: "",
	primaryEmail: "",
}

export const useUpdatePrimaryEmailFormState = createFormState<UpdatePrimaryEmailRequest>(initialState, {
	newEmail: [(s) => EmailValidator.validate(s.newEmail) || "Email address is invalid"],
	primaryEmail: [(s) => EmailValidator.validate(s.primaryEmail) || "Existing email address is invalid"],
})
