import moment from "moment-timezone"

import { Weekday, WeekdayLabel } from "../enums/TemplateEnums"

export type MomentOrNull = moment.Moment | null

export type ISODateDict = {
	isoDate: string
}

enum DateTimeFormat {
	ISODate = "YYYY-MM-DD", // 2026-01-01
	FullDate = "MMM D, YYYY", // January 1, 2026
	FullDateTime = "MMM D, YYYY, h:mm A", // January 1, 2026, 3:15 AM
	MonthDay = "M/D", // 1/1
	ShortDate = "M/D/YYYY", // 1/1/2026
	ShortDateWithWeekday = "ddd M/D/YYYY", // Wed 1/1/2026
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

		// DEBUG: Set close time to 11:59 PM on the date of the appointment, since we don't have a way to know the actual close time for each date
		// d.set("hour", 23)
		// d.set("minute", 59)

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

	GetShortDate(includeWeekday: boolean = false, includeTime: boolean = false): string {
		let dateStr = this.Format(includeWeekday ? DateTimeFormat.ShortDateWithWeekday : DateTimeFormat.ShortDate)

		if (includeTime) {
			dateStr += ", " + this.Format(DateTimeFormat.TimeOnly)
		}

		return dateStr
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

	static IsTimekeyInPast(key: number): boolean {
		const hours = Math.floor(key / 100)
		const minutes = key % 100

		const slotTime = new DateTime()
		slotTime.instant.set("hour", hours)
		slotTime.instant.set("minute", minutes)
		slotTime.instant.set("second", 0)

		return slotTime.instant.isBefore(moment())
	}
}
