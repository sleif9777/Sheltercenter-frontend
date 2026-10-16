import { RescheduleAppointmentRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type RescheduleFormFieldUpdater = FormFieldUpdateCallback<RescheduleAppointmentRequest>

const initialState: RescheduleAppointmentRequest = {
	apptID: 0,
	newApptID: 0,
}

export const useRescheduleFormState = createFormState<RescheduleAppointmentRequest>(initialState, {
	newApptID: [(s) => s.newApptID > 0 || "Pick a new timeslot"],
})
