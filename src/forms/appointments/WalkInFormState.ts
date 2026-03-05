import { AppointmentType } from "../../enums/AppointmentEnums"
import { CreateWalkInRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback, FormFullUpdateCallback } from "../FormState"

export type WalkInFormFieldUpdater = FormFieldUpdateCallback<CreateWalkInRequest>
export type WalkInFormFullUpdater = FormFullUpdateCallback<CreateWalkInRequest>

const initialState: CreateWalkInRequest = {
	adopterID: "*",
	firstName: "",
	lastName: "",
	primaryEmail: "",
	type: AppointmentType.ALL_AGES,
}

export const useWalkInFormState = createFormState<CreateWalkInRequest>(initialState, {
	adopterID: [(s) => s.adopterID == "*" || s.adopterID > 0 || "Must have an adopter"],
	firstName: [(s) => s.adopterID != "*" || s.firstName.length > 0 || "First name cannot be blank"],
	lastName: [(s) => s.adopterID != "*" || s.lastName.length > 0 || "Last name cannot be blank"],
	primaryEmail: [(s) => s.adopterID != "*" || s.primaryEmail.length > 0 || "Email cannot be blank"],
})
