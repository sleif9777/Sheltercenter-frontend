import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useSessionState } from "../../core/session/SessionState"
import { SecurityLevel } from "../../enums/UserEnums"
import { DashboardDog } from "../../models/DogModels"
import { makeLogInResponse } from "../../test/fixtures"
import DashboardsApp from "./DashboardsApp"
import { DashboardMode, useDashboardsState } from "./DashboardsAppState"

const PREVIEW_LABEL = "Preview as non-admin viewer"

function makeDog(ID: number, name: string, hidden: boolean): DashboardDog {
	return { hidden, ID, name, photoURL: "", unavailableDate: "2026-10-20" }
}

function renderAs(security: SecurityLevel) {
	useSessionState.getState().setUpSession(makeLogInResponse(security))
	render(
		<MemoryRouter>
			<DashboardsApp />
		</MemoryRouter>
	)
}

describe("DashboardsApp hiding", () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	beforeEach(() => {
		// Hovering opens a react-tooltip, which needs ResizeObserver (missing from jsdom)
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			}
		)
		useDashboardsState.setState({
			dogHash: {
				chosen: { needsSN: [], needsWC: [], readyToRoll: [] },
				fta: [],
				newlyInHome: [makeDog(1, "Biscuit", false), makeDog(2, "Pepper", true)],
			},
			mode: DashboardMode.WHO_WENT_HOME,
			refresh: () => {},
		})
	})

	it("lets admins preview the list as non-admins see it", async () => {
		renderAs(SecurityLevel.ADMIN)
		expect(screen.getByText("Pepper")).toBeInTheDocument()
		expect(screen.getByText(/1 hidden/)).toBeInTheDocument()

		await userEvent.click(screen.getByText(PREVIEW_LABEL))

		expect(screen.getByText("Biscuit")).toBeInTheDocument()
		expect(screen.queryByText("Pepper")).not.toBeInTheDocument()
		expect(screen.queryByText(/hidden/)).not.toBeInTheDocument()
		expect(screen.queryAllByRole("button").filter((b) => b.querySelector("[data-icon^=eye]"))).toHaveLength(0)
	})

	it("does not offer the preview to non-admins", () => {
		renderAs(SecurityLevel.GREETER)
		expect(screen.queryByText(PREVIEW_LABEL)).not.toBeInTheDocument()
		expect(screen.queryByText("Pepper")).not.toBeInTheDocument()
	})

	it("shows each dog's current state and flips the icon on hover", async () => {
		renderAs(SecurityLevel.ADMIN)
		const [shownButton, hiddenButton] = screen.getAllByRole("button").filter((b) => b.querySelector("[data-icon^=eye]"))
		const iconOf = (button: HTMLElement) => button.querySelector("[data-icon]")?.getAttribute("data-icon")

		expect(iconOf(shownButton)).toBe("eye")
		expect(iconOf(hiddenButton)).toBe("eye-slash")

		await userEvent.hover(shownButton)
		expect(iconOf(shownButton)).toBe("eye-slash")
		await userEvent.unhover(shownButton)
		expect(iconOf(shownButton)).toBe("eye")

		await userEvent.hover(hiddenButton)
		expect(iconOf(hiddenButton)).toBe("eye")
	})
})
