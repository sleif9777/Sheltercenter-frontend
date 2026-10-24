import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { SecurityLevel } from "../../enums/UserEnums"
import { makeLogInResponse } from "../../test/fixtures"
import { useSessionState } from "../session/SessionState"
import { NavigationBar } from "./NavigationBar"

function renderNavAs(security: SecurityLevel) {
	useSessionState.getState().setUpSession(makeLogInResponse(security))
	render(
		<MemoryRouter>
			<NavigationBar />
		</MemoryRouter>
	)
}

describe("NavigationBar", () => {
	it("shows adopters only their own pages", () => {
		renderNavAs(SecurityLevel.ADOPTER)
		expect(screen.getAllByText("Book Appointment").length).toBeGreaterThan(0)
		expect(screen.getAllByText("My Dog Watchlist").length).toBeGreaterThan(0)
		expect(screen.queryByText("Adopters")).not.toBeInTheDocument()
		expect(screen.queryByText("Reporting")).not.toBeInTheDocument()
	})

	it("shows greeters the calendar but no admin sections", () => {
		renderNavAs(SecurityLevel.GREETER)
		expect(screen.getAllByText("Calendar").length).toBeGreaterThan(0)
		expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
		expect(screen.queryByText("Reporting")).not.toBeInTheDocument()
	})

	it("shows admins every section, collapsed until opened", async () => {
		renderNavAs(SecurityLevel.ADMIN)
		for (const section of ["Scheduling", "Adoptions", "Adopters", "Dogs", "Reporting"]) {
			expect(screen.getByRole("button", { name: section })).toBeInTheDocument()
		}
		expect(screen.queryByText("Available Dogs")).not.toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Dogs" }))
		expect(screen.getByText("Available Dogs")).toBeInTheDocument()
		expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
	})

	it("shows the Change Log only to superusers", () => {
		renderNavAs(SecurityLevel.ADMIN)
		expect(screen.queryByText("Change Log")).not.toBeInTheDocument()
	})

	it("shows superusers the Change Log", () => {
		renderNavAs(SecurityLevel.SUPERUSER)
		expect(screen.getByText("Change Log")).toBeInTheDocument()
	})
})
