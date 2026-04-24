import { CreatePendingAdoptionRequest } from "../../api/pendingAdoptions/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type PendingAdoptionFormFieldUpdater = FormFieldUpdateCallback<CreatePendingAdoptionRequest>

const initialState: CreatePendingAdoptionRequest = {
	adopterID: 0,
	circumstance: 0,
	dogID: 0,
}

export const usePendingAdoptionFormState = createFormState<CreatePendingAdoptionRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must select an adopter"],
	dogID: [(s) => s.dogID > 0 || "Dog cannot be blank"],
})
