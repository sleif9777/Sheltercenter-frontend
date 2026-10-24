import { describe, expect, it, vi } from "vitest"

import { DateTime } from "../../utils/DateTime"
import { useScheduleState } from "./ScheduleAppState"

describe("useScheduleState", () => {
	it("tracks the current date when a tab stays open past midnight", () => {
		// The store was created at import time; move the clock to a later day
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2030-01-15T17:00:00Z")) // noon Eastern
		useScheduleState.setState({ dateUtil: new DateTime("2030-01-15") })

		const schedule = useScheduleState.getState()
		expect(schedule.isToday()).toBe(true)
		expect(schedule.getDayDiff()).toBe(0)
	})
})
