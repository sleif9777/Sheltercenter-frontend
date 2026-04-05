import { CheckInAppointmentRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type CheckInFormFieldUpdater = FormFieldUpdateCallback<CheckInAppointmentRequest>

const initialState: CheckInAppointmentRequest = {
	apptID: 0,
	state: "NC",
}

export const useCheckInFormState = createFormState<CheckInAppointmentRequest>(initialState, {
	city: [(s) => (s.city ?? "").length > 0 || !s.streetAddress || "This field is required."],
	postalCode: [(s) => (s.postalCode ?? "").length > 0 || !s.streetAddress || "This field is required."],
	state: [(s) => (s.state != "--" && (s.state ?? "").length > 0) || !s.streetAddress || "This field is required."],
})
