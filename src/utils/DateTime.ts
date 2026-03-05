import moment from "moment-timezone"

import { Weekday, WeekdayLabel } from "../enums/TemplateEnums"

export type MomentOrNull = moment.Moment | null

export type ISODateDict = {
	isoDate: string
}

enum DateTimeFormat {
	ISODate = "yyyy-MM-DD", // 2026-01-01
	FullDate = "MMM D, YYYY", // January 1, 2026
	FullDateTime = "MMM D, YYYY, h:mm A", // January 1, 2026, 3:15 AM
	MonthDay = "M/D", // 1/1
	ShortDate = "M/D/YYYY", // 1/1/2026
	ShortDateWithWeekday = "ddd M/D/YYYY",
	TimeOnly = "h:mm A", // 3:15 AM
	Weekday = "dddd", // Saturday
}

const TZ_EST = "America/New_York"

export class DateTime {
	instant: moment.Moment = moment().tz(TZ_EST)

	constructor(iso?: string) {
		this.instant = moment(iso).tz(TZ_EST)
	}

	CloseTime(): moment.Moment {
		const d = this.instant.clone()
		d.set("hour", this.GetWeekday() == Weekday.SATURDAY ? 15 : 18)
		d.set("minute", 0)

		return d
	}

	DiffWithDate(d2?: DateTime) {
		return this.instant.diff((d2 ?? new DateTime()).instant, "days")
	}

	// Get the date {step} days away from this date
	GetDiffedDate(step: number) {
		const diffedDate = this.instant.clone().add(step, "day")
		return diffedDate.format(DateTimeFormat.ISODate)
	}

	GetFullDateTime(): string {
		return this.Format(DateTimeFormat.FullDateTime)
	}

	GetISODate(): string {
		return this.Format(DateTimeFormat.ISODate)
	}

	GetMonthDay(): string {
		return this.Format(DateTimeFormat.MonthDay)
	}

	GetShortDate(includeWeekday: boolean = false): string {
		return this.Format(includeWeekday ? DateTimeFormat.ShortDateWithWeekday : DateTimeFormat.ShortDate)
	}

	GetTimeOnly(): string {
		return this.Format(DateTimeFormat.TimeOnly)
	}

	GetWeekday(): Weekday {
		const momentDay = this.instant.weekday() // 0 (Sun) .. 6 (Sat)
		return ((momentDay + 6) % 7) as Weekday
	}

	GetWeekdayStr(): string {
		return WeekdayLabel[this.GetWeekday()]
	}

	Format(f: DateTimeFormat) {
		return this.instant.format(f)
	}

	IsSunday(): boolean {
		return this.GetWeekday() == Weekday.SUNDAY
	}

	IsToday(): boolean {
		return this.DiffWithDate(new DateTime()) == 0
	}

	IsTodayOrLater(): boolean {
		return this.instant.isSameOrAfter(moment(), "day")
	}
}
