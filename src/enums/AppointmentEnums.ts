export enum AppointmentType {
	ADULTS,
	PUPPIES,
	ALL_AGES,
	PAPERWORK,
	SURRENDER,
	VISIT,
	DONATION_DROP_OFF,
	FUN_SIZE,
}

export const AppointmentTypeLabel: Record<AppointmentType, string> = {
	[AppointmentType.ADULTS]: "Adults",
	[AppointmentType.PUPPIES]: "Puppies",
	[AppointmentType.ALL_AGES]: "All Ages",
	[AppointmentType.PAPERWORK]: "Paperwork",
	[AppointmentType.SURRENDER]: "Surrender",
	[AppointmentType.VISIT]: "Visit",
	[AppointmentType.DONATION_DROP_OFF]: "Donation Drop Off",
	[AppointmentType.FUN_SIZE]: "Fun Size",
}

export enum Outcome {
	ADOPTION,
	FTA,
	CHOSEN,
	NO_DECISION,
	NO_SHOW,
}

export const OutcomeLabel: Record<Outcome, string> = {
	[Outcome.ADOPTION]: "Adoption",
	[Outcome.FTA]: "FTA",
	[Outcome.CHOSEN]: "Chosen",
	[Outcome.NO_DECISION]: "No Decision",
	[Outcome.NO_SHOW]: "No Show",
}
