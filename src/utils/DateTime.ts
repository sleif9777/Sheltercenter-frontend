import moment from "moment-timezone"

import { Weekday, WeekdayLabel } from "../enums/TemplateEnums"

export type MomentOrNull = moment.Moment | null

export type ISODateDict = {
	isoDate: string
}

export type TimeDict = {
	hour: number
	minute: number
}

export type TimeRequest = TimeDict

enum DateTimeFormat {
	ISODate = "YYYY-MM-DD", // 2026-01-01
	FullDate = "MMM D, YYYY", // January 1, 2026
	FullDateTime = "MMM D, YYYY, h:mm A", // January 1, 2026, 3:15 AM
	MonthDay = "M/D", // 1/1
	ShortDate = "M/D/YYYY", // 1/1/2026
	ShortDateWithWeekday = "ddd M/D/YYYY", // Wed 1/1/2026
	TimeOnly = "h:mm A", // 3:15 AM
	Weekday = "dddd", // Saturday
	SlotLabel = "ddd (M/D) h:mma", // Mon (8/17) 1:00pm
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

	GetOpenTime(): moment.Moment {
		const d = this.instant.clone()
		d.set("hour", this.GetWeekday() == Weekday.THURSDAY ? 13 : 12)
		d.set("minute", 0)
		d.set("second", 0)
		d.set("millisecond", 0)
		return d
	}

	GetSlotLabel(): string {
		return this.Format(DateTimeFormat.SlotLabel)
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

	static IsClosedForBooking(key: number): boolean {
		const hours = Math.floor(key / 100)
		const minutes = key % 100

		const slotTime = new DateTime()
		slotTime.instant.set("hour", hours)
		slotTime.instant.set("minute", minutes)
		slotTime.instant.set("second", 0)

		const cutoffTime = slotTime.instant.clone().subtract(2, "hours")

		return new DateTime().instant.isAfter(cutoffTime)
	}
}

const VISIT_DAYS = new Set([Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY])
const PICKUP_DAYS = new Set([Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY, Weekday.SATURDAY])

function slotsForDay(dateUtil: DateTime, eligibleDays: Set<Weekday>, now: moment.Moment): string[] {
	const weekday = dateUtil.GetWeekday()
	if (!eligibleDays.has(weekday)) return []

	const open = dateUtil.GetOpenTime()
	const close = dateUtil.CloseTime()
	const slots: string[] = []

	const cursor = open.clone()
	while (cursor.isBefore(close)) {
		if (cursor.isAfter(now)) {
			const slotDt = new DateTime(cursor.toISOString())
			slots.push(slotDt.GetSlotLabel())
		}
		cursor.add(30, "minutes")
	}
	return slots
}

export function generateVisitTimeSlots(): string[] {
	const now = moment().tz(TZ_EST)
	const slots: string[] = []
	for (let i = 0; i < 7; i++) {
		const dateUtil = new DateTime(new DateTime().GetDiffedDate(i))
		slots.push(...slotsForDay(dateUtil, VISIT_DAYS, now))
	}
	return slots
}

export function generatePickupTimeSlots(readyToRollInstant: string): string[] {
	const rtr = moment(readyToRollInstant).tz(TZ_EST)
	const now = moment().tz(TZ_EST)
	const cutoff = now.isAfter(rtr) ? now : rtr
	const rtrDateUtil = new DateTime(rtr.toISOString())
	const slots: string[] = []

	for (let i = 0; i < 3; i++) {
		const isoDate = rtrDateUtil.GetDiffedDate(i)
		const dateUtil = new DateTime(isoDate)
		slots.push(...slotsForDay(dateUtil, PICKUP_DAYS, cutoff))
	}
	return slots
}
