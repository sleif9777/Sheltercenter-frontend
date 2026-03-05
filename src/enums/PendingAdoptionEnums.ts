export enum CircumstanceOptions {
	HOST_WEEKEND = 0,
	FOSTER = 1,
	APPOINTMENT = 2,
	FRIEND_OF_FOSTER = 3,
	FRIEND_OF_MOLLY = 4,
	OTHER = 5,
	OPEN_HOUSE = 6,
}

export const CircumstanceOptionsLabel: Record<CircumstanceOptions, string> = {
	[CircumstanceOptions.HOST_WEEKEND]: "Host Weekend",
	[CircumstanceOptions.FOSTER]: "Foster",
	[CircumstanceOptions.APPOINTMENT]: "Appointment",
	[CircumstanceOptions.FRIEND_OF_FOSTER]: "Friend of Foster",
	[CircumstanceOptions.FRIEND_OF_MOLLY]: "Friend of Molly",
	[CircumstanceOptions.OTHER]: "Other",
	[CircumstanceOptions.OPEN_HOUSE]: "Open House",
}

export enum PendingAdoptionStatus {
	CHOSEN = 0,
	NEEDS_VETTING = 1,
	NEEDS_WELL_CHECK = 2,
	READY_TO_ROLL = 3,
	COMPLETED = 4,
	CANCELED = 5,
}

export const PendingAdoptionStatusLabel: Record<PendingAdoptionStatus, string> = {
	[PendingAdoptionStatus.CHOSEN]: "Chosen",
	[PendingAdoptionStatus.NEEDS_VETTING]: "Needs Vetting",
	[PendingAdoptionStatus.NEEDS_WELL_CHECK]: "Needs Well Check",
	[PendingAdoptionStatus.READY_TO_ROLL]: "Ready to Roll",
	[PendingAdoptionStatus.COMPLETED]: "Completed",
	[PendingAdoptionStatus.CANCELED]: "Canceled",
}
