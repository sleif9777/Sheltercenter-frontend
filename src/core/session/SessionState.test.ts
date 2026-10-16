import { describe, expect, it, vi } from "vitest"

import { SecurityLevel } from "../../enums/UserEnums"
import { makeLogInResponse } from "../../test/fixtures"
import { useSessionState } from "./SessionState"

const ROLE_FLAGS: [SecurityLevel, string][] = [
	[SecurityLevel.ADOPTER, "adopterUser"],
	[SecurityLevel.GREETER, "greeterUser"],
	[SecurityLevel.ADMIN, "adminUser"],
	[SecurityLevel.SUPERUSER, "adminUser"],
	[SecurityLevel.DASHBOARD, "dashboardUser"],
]

function roleFlags() {
	const { adminUser, adopterUser, dashboardUser, greeterUser } = useSessionState.getState()
	return { adminUser, adopterUser, dashboardUser, greeterUser }
}

describe("SessionState", () => {
	it.each(ROLE_FLAGS)("sets exactly one role flag for security level %s", (security, flag) => {
		useSessionState.getState().setUpSession(makeLogInResponse(security))
		const flags = roleFlags()
		expect(Object.entries(flags).filter(([, on]) => on)).toEqual([[flag, true]])
		expect(useSessionState.getState().isAuthenticated).toBe(true)
	})

	it("only shows the watchlist warning to adopters", () => {
		useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.ADOPTER))
		expect(useSessionState.getState().acknowledgements.watchlist).toBe(false)
		useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.ADMIN))
		expect(useSessionState.getState().acknowledgements.watchlist).toBe(true)
	})

	it("expires sessions after 7 days, or 28 for dashboards", () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2026-10-15T16:00:00Z"))
		const { setUpSession, validateSession } = useSessionState.getState()

		setUpSession(makeLogInResponse(SecurityLevel.ADMIN))
		expect(useSessionState.getState().sessionExpires).toBe("2026-10-22T16:00:00.000Z")
		setUpSession(makeLogInResponse(SecurityLevel.DASHBOARD))
		// Same local time 28 days later; daylight saving ends in between, so UTC shifts an hour
		expect(useSessionState.getState().sessionExpires).toBe("2026-11-12T17:00:00.000Z")

		setUpSession(makeLogInResponse(SecurityLevel.ADMIN))
		expect(validateSession()).toBe(true)
		vi.setSystemTime(new Date("2026-10-22T16:00:01Z"))
		expect(useSessionState.getState().validateSession()).toBe(false)
		expect(useSessionState.getState().isAuthenticated).toBe(false)
		expect(useSessionState.getState().accessToken).toBeUndefined()
	})

	it("persists the session to localStorage without functions", () => {
		useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.GREETER))
		const stored = JSON.parse(localStorage.getItem("auth-storage") ?? "{}")
		expect(stored.state).toMatchObject({
			accessToken: "access-1",
			greeterUser: true,
			isAuthenticated: true,
			refreshToken: "refresh-1",
		})
		expect(stored.state.user.firstName).toBe("Avery")
		expect(stored.state).not.toHaveProperty("setUpSession")
	})

	it("tracks and clears the current appointment", () => {
		const { setCurrentAppt, setUpSession } = useSessionState.getState()
		setUpSession(makeLogInResponse(SecurityLevel.ADOPTER))
		setCurrentAppt({
			ID: 9,
			instantDisplay: "Oct 16, 02:00 PM",
			isoDate: "2026-10-16",
			isoInstant: "2026-10-16T14:00:00-04:00",
		} as Parameters<typeof setCurrentAppt>[0])
		expect(useSessionState.getState().user?.currentAppt?.ID).toBe(9)
		useSessionState.getState().removeCurrentAppt()
		expect(useSessionState.getState().user?.currentAppt).toBeUndefined()
	})

	it("logs out completely, including acknowledgements", () => {
		const state = useSessionState.getState()
		state.setUpSession(makeLogInResponse(SecurityLevel.ADOPTER))
		state.acknowledgeWatchlist()
		useSessionState.getState().logOut()
		const after = useSessionState.getState()
		expect(after.isAuthenticated).toBe(false)
		expect(after.user).toBeUndefined()
		expect(after.acknowledgements.watchlist).toBe(false)
		expect(Object.values(roleFlags()).some(Boolean)).toBe(false)
	})
})
