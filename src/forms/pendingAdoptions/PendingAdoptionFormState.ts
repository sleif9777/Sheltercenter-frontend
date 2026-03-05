import { CreatePendingAdoptionRequest } from "../../api/pendingAdoptions/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type PendingAdoptionFormFieldUpdater = FormFieldUpdateCallback<CreatePendingAdoptionRequest>

const initialState: CreatePendingAdoptionRequest = {
	adopterID: 0,
	circumstance: 0,
	dog: "",
}

export const usePendingAdoptionFormState = createFormState<CreatePendingAdoptionRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must select an adopter"],
	dog: [(s) => s.dog.length > 0 || "Dog cannot be blank"],
})
