import { DateTime } from "../../utils/DateTime"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type JumpToDateRequest = {
	// Not a real request, but needed to match the current pattern
	newDate?: DateTime
}

export type JumpToDateFormFieldUpdater = FormFieldUpdateCallback<JumpToDateRequest>

const initialState: JumpToDateRequest = {
	newDate: undefined,
}

export const useJumpToDateFormState = createFormState<JumpToDateRequest>(initialState, {
	newDate: [(s) => (!!s.newDate && /^\d{4}-\d{2}-\d{2}$/.test(s.newDate.GetISODate())) || "Must be a valid date"],
})
