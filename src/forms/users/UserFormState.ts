import * as EmailValidator from "email-validator"

import { AdopterApprovalStatus } from "../../enums/AdopterEnums"
import { SaveUserFormRequest } from "../../api/users/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type UserFormFieldUpdater = FormFieldUpdateCallback<SaveUserFormRequest>

export enum UserFormContext {
	NEW = 1,
	EDIT = 2,
}

const initialState: SaveUserFormRequest = {
	context: UserFormContext.EDIT,
	firstName: "",
	internalNotes: "",
	lastName: "",
	primaryEmail: "",
	status: AdopterApprovalStatus.APPROVED,
}

export const useUserFormState = createFormState<SaveUserFormRequest>(initialState, {
	firstName: [(s) => s.firstName.length > 0 || "First name cannot be blank"],
	internalNotes: [(s) => (s.internalNotes ?? "").length <= 500 || "Notes cannot exceed 500 characters"],
	lastName: [(s) => s.lastName.length > 0 || "Last name cannot be blank"],
	primaryEmail: [(s) => EmailValidator.validate(s.primaryEmail) || "Email address is invalid"],
})
