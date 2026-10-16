import { afterEach, describe, expect, it, vi } from "vitest"

import { Weekday } from "../enums/TemplateEnums"
import { DateTime } from "./DateTime"

describe("DateTime", () => {
	afterEach(() => vi.useRealTimers())

	it("formats instants in Eastern time", () => {
		// 2026-03-07T02:30Z is 9:30 PM on Mar 6 in New York
		const dt = new DateTime("2026-03-07T02:30:00Z")
		expect(dt.GetISODate()).toBe("2026-03-06")
		expect(dt.GetShortDate()).toBe("3/6/2026")
		expect(dt.GetShortDate(true, true)).toBe("Fri 3/6/2026, 9:30 PM")
		expect(dt.GetTimeOnly()).toBe("9:30 PM")
		expect(dt.GetFullDateTime()).toBe("Mar 6, 2026, 9:30 PM")
		expect(dt.GetMonthDay()).toBe("3/6")
		expect(dt.GetSlotLabel()).toBe("Fri (3/6) 9:30pm")
	})

	it("maps weekdays to the Monday-first Weekday enum", () => {
		expect(new DateTime("2026-10-12").GetWeekday()).toBe(Weekday.MONDAY)
		expect(new DateTime("2026-10-17").GetWeekday()).toBe(Weekday.SATURDAY)
		expect(new DateTime("2026-10-18").GetWeekday()).toBe(Weekday.SUNDAY)
		expect(new DateTime("2026-10-18").IsSunday()).toBe(true)
	})

	it("uses the shelter's open and close hours", () => {
		expect(new DateTime("2026-10-15").GetOpenTime().format("HH:mm")).toBe("13:00") // Thursday
		expect(new DateTime("2026-10-16").GetOpenTime().format("HH:mm")).toBe("12:00")
		expect(new DateTime("2026-10-17").CloseTime().format("HH:mm")).toBe("15:00") // Saturday
		expect(new DateTime("2026-10-16").CloseTime().format("HH:mm")).toBe("18:00")
	})

	it("steps across month boundaries", () => {
		const dt = new DateTime("2026-10-30")
		expect(dt.GetDiffedDate(3)).toBe("2026-11-02")
		expect(dt.GetDiffedDate(-30)).toBe("2026-09-30")
	})

	it("closes booking two hours before a slot", () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2026-10-16T15:30:00Z")) // 11:30 AM Eastern
		expect(DateTime.IsClosedForBooking(1300)).toBe(true) // 1:00 PM slot, cutoff was 11:00 AM
		expect(DateTime.IsClosedForBooking(1400)).toBe(false) // 2:00 PM slot, cutoff is 12:00 PM
	})
})
