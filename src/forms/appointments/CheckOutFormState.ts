import { Outcome } from "../../enums/AppointmentEnums"
import { CheckOutAppointmentRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type CheckOutFormFieldUpdater = FormFieldUpdateCallback<CheckOutAppointmentRequest>

const initialState: CheckOutAppointmentRequest = {
	apptID: 0,
	outcome: Outcome.ADOPTION,
	sendSleepoverInfo: false,
}

export const useCheckOutFormState = createFormState<CheckOutAppointmentRequest>(initialState, {
	apptID: [(s) => s.apptID > 0 || "Must select an appointment"],
	dog: [
		(s) =>
			s.outcome >= Outcome.NO_DECISION || (s.dog ?? "").length > 1 || "Must select a dog for adoption/chosen/FTA outcome",
	],
})
