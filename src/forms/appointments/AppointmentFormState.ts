import { AppointmentType } from "../../enums/AppointmentEnums"
import { CreateAppointmentRequest } from "../../api/appointments/Requests"
import { DateTime } from "../../utils/DateTime"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

// Surrender names are collected as original/new and resolved to surrenderDogName/fka on submit
export type AppointmentFormData = Omit<CreateAppointmentRequest, "fka" | "surrenderDogName"> & {
	surrenderKeepsNewName: boolean
	surrenderNewName?: string
	surrenderOriginalName?: string
}

export type AppointmentFormFieldUpdater = FormFieldUpdateCallback<AppointmentFormData>

const initialState: AppointmentFormData = {
	hour: 0,
	isoDate: "1970-01-01",
	locked: false,
	minute: 0,
	pendingAdoptionID: 0,
	surrenderKeepsNewName: false,
	type: AppointmentType.ADULTS,
}

export const useAppointmentFormState = createFormState<AppointmentFormData>(initialState, {
	isoDate: [
		(s) => !new DateTime(s.isoDate).IsSunday() || "We are closed on Sundays",
		(s) => new DateTime(s.isoDate).IsTodayOrLater() || "Must be today or later",
	],
	minute: [(s) => s.minute % 15 === 0 || "Must be scheduled in 15-minute intervals"],
	notes: [
		(s) =>
			s.type != AppointmentType.VISIT ||
			(s.pendingAdoptionID ?? 0) > 0 ||
			(s.notes ?? "").trim().length >= 1 ||
			"Dog cannot be blank",
		(s) =>
			s.type != AppointmentType.PAPERWORK ||
			(s.pendingAdoptionID ?? 0) > 0 ||
			(s.notes ?? "").length > 0 ||
			"Required when no adoption is selected",
	],
	pendingAdoptionID: [
		(s) =>
			s.type != AppointmentType.PAPERWORK ||
			(s.pendingAdoptionID ?? 0) > 0 ||
			(s.notes ?? "").length > 0 ||
			"Must select a pending adoption",
		(s) =>
			s.type != AppointmentType.VISIT ||
			(s.pendingAdoptionID ?? 0) > 0 ||
			(s.notes ?? "").trim().length > 0 ||
			"Must select a pending adoption",
	],
	surrenderNewName: [
		(s) =>
			s.type != AppointmentType.SURRENDER ||
			!s.surrenderKeepsNewName ||
			(s.surrenderNewName ?? "").trim().length >= 1 ||
			"New name cannot be blank",
	],
	surrenderOriginalName: [
		(s) =>
			s.type != AppointmentType.SURRENDER ||
			(s.surrenderOriginalName ?? "").trim().length >= 1 ||
			"Original name cannot be blank",
	],
})

export function toCreateAppointmentRequest({
	surrenderKeepsNewName,
	surrenderNewName,
	surrenderOriginalName,
	...req
}: AppointmentFormData): CreateAppointmentRequest {
	if (req.type != AppointmentType.SURRENDER) {
		return req
	}

	const originalName = (surrenderOriginalName ?? "").trim()
	const newName = (surrenderNewName ?? "").trim()

	// Only file an FKA when the dog is keeping a genuinely different name
	if (!surrenderKeepsNewName || newName.toLowerCase() == originalName.toLowerCase()) {
		return { ...req, surrenderDogName: originalName }
	}

	return { ...req, fka: originalName, surrenderDogName: newName }
}
