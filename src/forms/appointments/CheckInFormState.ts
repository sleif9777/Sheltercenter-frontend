import { CheckInAppointmentRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type CheckInFormFieldUpdater = FormFieldUpdateCallback<CheckInAppointmentRequest>

const initialState: CheckInAppointmentRequest = {
	apptID: 0,
}

export const useCheckInFormState = createFormState<CheckInAppointmentRequest>(initialState, {})
