export enum Weekday {
	MONDAY,
	TUESDAY,
	WEDNESDAY,
	THURSDAY,
	FRIDAY,
	SATURDAY,
	SUNDAY,
}

export const WeekdayLabel: Record<Weekday, string> = {
	[Weekday.MONDAY]: "Monday",
	[Weekday.TUESDAY]: "Tuesday",
	[Weekday.WEDNESDAY]: "Wednesday",
	[Weekday.THURSDAY]: "Thursday",
	[Weekday.FRIDAY]: "Friday",
	[Weekday.SATURDAY]: "Saturday",
	[Weekday.SUNDAY]: "Sunday",
}
