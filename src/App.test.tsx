import { render, screen } from "@testing-library/react"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import App from "./App"
import { useSessionState } from "./core/session/SessionState"
import { SecurityLevel } from "./enums/UserEnums"
import { makeLogInResponse } from "./test/fixtures"

// Renders the whole app (every route import, MUI, rsuite, Quill, FontAwesome)
// to catch dependency upgrades that break module loading or initial render.
describe("App", () => {
	beforeEach(() => {
		window.history.pushState({}, "", "/")
		const empty = { data: {}, status: 200 }
		vi.spyOn(axios, "get").mockResolvedValue(empty)
		vi.spyOn(axios, "post").mockResolvedValue(empty)
	})

	it("shows the login page when logged out", async () => {
		render(<App />)
		expect(await screen.findByText("Appointment Scheduling Portal")).toBeInTheDocument()
	})

	it.each([
		[SecurityLevel.ADOPTER, "Book Appointment"],
		[SecurityLevel.GREETER, "Calendar"],
		[SecurityLevel.ADMIN, "Scheduling"],
	])("renders the signed-in shell for security level %s", async (security, navText) => {
		// A static page, so the test doesn't depend on each landing page's API data
		window.history.pushState({}, "", "/privacy/")
		useSessionState.getState().setUpSession(makeLogInResponse(security))
		render(<App />)
		expect((await screen.findAllByText(navText)).length).toBeGreaterThan(0)
		expect(screen.queryByText("Appointment Scheduling Portal")).not.toBeInTheDocument()
	})
})
