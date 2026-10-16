import { render, screen, waitFor } from "@testing-library/react"
import axios from "axios"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { useSessionState } from "../../core/session/SessionState"
import { SecurityLevel } from "../../enums/UserEnums"
import { makeLogInResponse } from "../../test/fixtures"
import { LoginApp } from "./LoginApp"

function renderAt(path: string) {
	render(
		<MemoryRouter initialEntries={[path]}>
			<LoginApp />
		</MemoryRouter>
	)
}

describe("LoginApp", () => {
	it("shows the login form when there is no email link", () => {
		renderAt("/")
		expect(screen.getByText("Appointment Scheduling Portal")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument()
	})

	it("signs in automatically from an email link", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue({ data: makeLogInResponse(SecurityLevel.ADOPTER), status: 202 })

		renderAt("/?email=avery%40example.invalid")

		expect(screen.getByText("Signing you in…")).toBeInTheDocument()
		await waitFor(() => expect(useSessionState.getState().isAuthenticated).toBe(true))
		const url = new URL(get.mock.calls[0][0])
		expect(url.pathname).toBe("/UserProfiles/LogIn/")
		expect(url.searchParams.get("primaryEmail")).toBe("avery@example.invalid")
		expect(useSessionState.getState().adopterUser).toBe(true)
	})

	it("sends adopters with expired applications to a new application", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true })
		const open = vi.spyOn(window, "open").mockReturnValue(null)
		vi.spyOn(axios, "get").mockRejectedValue(Object.assign(new Error("418"), { response: { data: {}, status: 418 } }))

		renderAt("/?email=expired%40example.invalid")

		await waitFor(() => expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument())
		vi.advanceTimersByTime(1600)
		expect(open).toHaveBeenCalledWith("https://www.shelterluv.com/matchme/adopt/SGNC/Dog", "_blank")
		expect(useSessionState.getState().isAuthenticated).toBe(false)
	})
})
