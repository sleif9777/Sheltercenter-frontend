import * as EmailValidator from "email-validator"

import { PrimaryEmailRequest } from "../../api/users/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type LoginFormFieldUpdater = FormFieldUpdateCallback<PrimaryEmailRequest>

const initialState: PrimaryEmailRequest = {
	primaryEmail: "",
}

export const useLoginFormState = createFormState<PrimaryEmailRequest>(initialState, {
	primaryEmail: [(s) => (s.primaryEmail != "" && EmailValidator.validate(s.primaryEmail)) || "Email address is invalid"],
})
