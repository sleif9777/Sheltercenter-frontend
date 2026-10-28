export interface IDashboardNote {
	ID: number
	// null when the dog was typed in because it isn't listed
	dogID: number | null
	dogName: string
	note: string
	photoURL: string
	// ISO date of the last day the note shows; null to keep it until removed
	showUntil: string | null
}
