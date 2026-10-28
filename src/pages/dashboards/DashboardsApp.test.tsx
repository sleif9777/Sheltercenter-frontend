import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useSessionState } from "../../core/session/SessionState"
import { SecurityLevel } from "../../enums/UserEnums"
import { IDashboardNote } from "../../models/DashboardNoteModels"
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
			notes: [],
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

	it("centers the preview checkbox", () => {
		renderAs(SecurityLevel.ADMIN)
		expect(screen.getByText(PREVIEW_LABEL).closest(".m-auto")).not.toBeNull()
	})

	it("renders the confirmation outside the faded hidden-dog card", async () => {
		renderAs(SecurityLevel.ADMIN)
		const hiddenButton = screen.getAllByRole("button").filter((b) => b.querySelector("[data-icon^=eye]"))[1]

		await userEvent.click(hiddenButton)

		const dialog = screen.getByRole("dialog")
		expect(dialog.closest("li")).toBeNull()
		expect(within(dialog).getByText("Show this dog")).toBeInTheDocument()
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

function makeNote(ID: number, dogName: string, note: string, showUntil: string | null = null): IDashboardNote {
	return { dogID: null, dogName, ID, note, photoURL: "", showUntil }
}

describe("DashboardsApp notes", () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	beforeEach(() => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			}
		)
		useDashboardsState.setState({
			dogHash: { chosen: { needsSN: [], needsWC: [], readyToRoll: [] }, fta: [], newlyInHome: [] },
			mode: DashboardMode.WHO_WENT_HOME,
			notes: [],
			refresh: () => {},
		})
	})

	it("hides the Notes tab from the dashboard while there are no notes", () => {
		renderAs(SecurityLevel.DASHBOARD)
		expect(screen.queryByText("Notes")).not.toBeInTheDocument()
	})

	it("shows every note, including several for one dog, without edit controls", async () => {
		useDashboardsState.setState({ notes: [makeNote(1, "Biscuit", "Offsite"), makeNote(2, "Biscuit", "Trial"), makeNote(3, "Waffles", "Trial")] })
		renderAs(SecurityLevel.DASHBOARD)

		await userEvent.click(screen.getByText("Notes"))

		expect(screen.getAllByText("Biscuit")).toHaveLength(2)
		expect(screen.getByText("Waffles")).toBeInTheDocument()
		expect(screen.getByText("Offsite")).toBeInTheDocument()
		expect(screen.queryByText("Add Note")).not.toBeInTheDocument()
		expect(screen.queryAllByRole("button").filter((b) => b.querySelector("[data-icon=trash]"))).toHaveLength(0)
	})

	it("leaves the Notes tab when its last note is removed", () => {
		useDashboardsState.setState({ mode: DashboardMode.NOTES, notes: [] })
		renderAs(SecurityLevel.DASHBOARD)

		expect(useDashboardsState.getState().mode).toBe(DashboardMode.WHO_WENT_HOME)
	})

	it("only lets admins and superusers add and remove notes", () => {
		useDashboardsState.setState({ mode: DashboardMode.NOTES, notes: [makeNote(1, "Biscuit", "Offsite")] })
		renderAs(SecurityLevel.GREETER)

		expect(screen.queryByText("Add Note")).not.toBeInTheDocument()
		expect(screen.queryAllByRole("button").filter((b) => b.querySelector("[data-icon=trash]"))).toHaveLength(0)
	})

	it.each([
		["admins", SecurityLevel.ADMIN],
		["superusers", SecurityLevel.SUPERUSER],
	])("shows %s the Notes tab with no notes so they can add the first", async (_, level) => {
		renderAs(level)

		await userEvent.click(screen.getByText("Notes"))

		expect(screen.getByText("Add Note")).toBeInTheDocument()
	})

	it("shows the last day to editors", () => {
		useDashboardsState.setState({ mode: DashboardMode.NOTES, notes: [makeNote(1, "Biscuit", "Trial", "2026-10-31")] })
		renderAs(SecurityLevel.ADMIN)
		expect(screen.getByText(/Shows through/)).toBeInTheDocument()
	})

	it("hides the last day from the dashboard login", () => {
		useDashboardsState.setState({ mode: DashboardMode.NOTES, notes: [makeNote(1, "Biscuit", "Trial", "2026-10-31")] })
		renderAs(SecurityLevel.DASHBOARD)
		expect(screen.getByText("Trial")).toBeInTheDocument()
		expect(screen.queryByText(/Shows through/)).not.toBeInTheDocument()
	})

	it("removes a note after confirming", async () => {
		const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 200 })
		const refresh = vi.fn()
		useDashboardsState.setState({ mode: DashboardMode.NOTES, notes: [makeNote(9, "Biscuit", "Offsite")], refresh })
		renderAs(SecurityLevel.SUPERUSER)

		await userEvent.click(screen.getAllByRole("button").filter((b) => b.querySelector("[data-icon=trash]"))[0])
		await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /continue/i }))

		expect(post).toHaveBeenCalledWith(expect.stringContaining("/DashboardNotes/DeleteDashboardNote/"), { noteID: 9 }, expect.anything())
		expect(refresh).toHaveBeenCalled()
	})
})
