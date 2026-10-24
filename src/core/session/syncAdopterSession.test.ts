import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CalendarRestrictionStatusResponse } from "../../api/adopters/Responses"
import { SecurityLevel } from "../../enums/UserEnums"
import { makeLogInResponse } from "../../test/fixtures"
import { useSessionState } from "./SessionState"
import { syncAdopterSession } from "./syncAdopterSession"

const APPT = {
	ID: 9,
	instantDisplay: "Saturday, October 24 at 2:00 PM",
	isoDate: "2026-10-24",
	isoInstant: "2026-10-24T14:00:00-04:00",
}

function respondWith(data: CalendarRestrictionStatusResponse) {
	vi.spyOn(axios, "get").mockResolvedValue({ config: {}, data, headers: {}, status: 200, statusText: "OK" })
}

function user() {
	return useSessionState.getState().user!
}

describe("syncAdopterSession", () => {
	beforeEach(() => {
		const login = makeLogInResponse(SecurityLevel.ADOPTER)
		useSessionState.getState().setUpSession({ ...login, user: { ...login.user, currentAppt: APPT, restrictCalendar: true } })
	})

	it("restores calendar access and clears an appointment whose outcome was recorded", async () => {
		respondWith({ currentAppt: null, restrictCalendar: false })
		await syncAdopterSession(42)
		expect(user().restrictCalendar).toBe(false)
		expect(user().currentAppt).toBeUndefined()
	})

	it("picks up a rescheduled appointment", async () => {
		const moved = { ...APPT, ID: 10, isoInstant: "2026-10-25T11:00:00-04:00" }
		respondWith({ currentAppt: moved, restrictCalendar: true })
		await syncAdopterSession(42)
		expect(user().currentAppt).toEqual(moved)
	})

	it("leaves the appointment alone when the backend doesn't send one", async () => {
		respondWith({ restrictCalendar: false })
		await syncAdopterSession(42)
		expect(user().restrictCalendar).toBe(false)
		expect(user().currentAppt).toEqual(APPT)
	})
})
