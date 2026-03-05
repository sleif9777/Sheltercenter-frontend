import { ChangeDogRequest } from "../../api/pendingAdoptions/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type ChangeDogFormFieldUpdater = FormFieldUpdateCallback<ChangeDogRequest>

const initialState: ChangeDogRequest = {
	adoptionID: 0,
	newDog: "",
}

export const useChangeDogFormState = createFormState<ChangeDogRequest>(initialState, {
	adoptionID: [(s) => s.adoptionID > 0 || "Must have an adoption selected"],
	newDog: [(s) => s.newDog.length > 0 || "New dog cannot be blank"],
})
