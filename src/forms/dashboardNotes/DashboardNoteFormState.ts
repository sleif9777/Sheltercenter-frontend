import { CreateDashboardNoteRequest } from "../../api/dashboardNotes/Requests"
import { DateTime } from "../../utils/DateTime"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type DashboardNoteFormData = {
	dogID: number
	dogName: string
	// Optional: remove the note automatically after showUntil (an ISO date)
	expires: boolean
	// "Dog Not Listed": type the dog's name instead of choosing a listed dog
	notListed: boolean
	note: string
	showUntil: string
}

export type DashboardNoteFormFieldUpdater = FormFieldUpdateCallback<DashboardNoteFormData>

export const NOTE_QUICK_OPTIONS = ["Offsite", "Trial"]

const initialState: DashboardNoteFormData = {
	dogID: 0,
	dogName: "",
	expires: false,
	note: "",
	notListed: false,
	showUntil: "",
}

export const useDashboardNoteFormState = createFormState<DashboardNoteFormData>(initialState, {
	dogID: [(s) => s.notListed || s.dogID > 0 || "Dog cannot be blank"],
	dogName: [(s) => !s.notListed || s.dogName.trim().length > 0 || "Dog cannot be blank"],
	note: [(s) => s.note.trim().length > 0 || "Note cannot be blank"],
	showUntil: [(s) => !s.expires || (s.showUntil.length > 0 && DateTime.FromISODate(s.showUntil).IsTodayOrLater()) || "Choose today or a later date"],
})

export function toCreateDashboardNoteRequest(data: DashboardNoteFormData): CreateDashboardNoteRequest {
	const note = data.note.trim()
	const dog = data.notListed ? { dogName: data.dogName.trim() } : { dogID: data.dogID }
	return { ...dog, note, ...(data.expires ? { showUntil: data.showUntil } : {}) }
}
