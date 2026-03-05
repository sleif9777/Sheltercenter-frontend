import { AppointmentType } from "../../enums/AppointmentEnums"
import { CreateAppointmentRequest } from "../../api/appointments/Requests"
import { DateTime } from "../../utils/DateTime"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type AppointmentFormFieldUpdater = FormFieldUpdateCallback<CreateAppointmentRequest>

const initialState: CreateAppointmentRequest = {
	hour: 0,
	isoDate: "1970-01-01",
	locked: false,
	minute: 0,
	pendingAdoptionID: 0,
	type: AppointmentType.ADULTS,
}

export const useAppointmentFormState = createFormState<CreateAppointmentRequest>(initialState, {
	isoDate: [
		(s) => !new DateTime(s.isoDate).IsSunday() || "We are closed on Sundays",
		(s) => new DateTime(s.isoDate).IsTodayOrLater() || "Must be today or later",
	],
	minute: [(s) => s.minute % 15 === 0 || "Must be scheduled in 15-minute intervals"],
	notes: [
		(s) =>
			!(s.type == AppointmentType.SURRENDER || s.type == AppointmentType.VISIT) ||
			(s.notes ?? "").length >= 1 ||
			"Dog cannot be blank",
	],
	pendingAdoptionID: [
		(s) => s.type != AppointmentType.PAPERWORK || (s.pendingAdoptionID ?? 0) > 0 || "Must select a pending adoption",
	],
})
