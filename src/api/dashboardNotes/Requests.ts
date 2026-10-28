// Send either dogID (a listed dog) or dogName (a dog not listed), not both.
export type CreateDashboardNoteRequest = {
	dogID?: number
	dogName?: string
	note: string
	// ISO date of the last day the note shows; omit to keep it until removed
	showUntil?: string
}

export type DashboardNoteIDRequest = {
	noteID: number
}
