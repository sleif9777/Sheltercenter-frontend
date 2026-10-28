import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ModalState } from "../../core/components/modal/Modal"
import { useDashboardsState } from "../../pages/dashboards/DashboardsAppState"
import { DashboardNoteForm } from "./DashboardNoteForm"
import { DashboardNoteFormData, toCreateDashboardNoteRequest, useDashboardNoteFormState } from "./DashboardNoteFormState"

const modalState: ModalState = { close: vi.fn(), isOpen: true, open: vi.fn(), setIsOpen: vi.fn(), toggle: vi.fn() }

function formData(overrides: Partial<DashboardNoteFormData>): DashboardNoteFormData {
	return { dogID: 0, dogName: "", expires: false, note: "", notListed: false, showUntil: "", ...overrides }
}

describe("toCreateDashboardNoteRequest", () => {
	it("sends the listed dog's ID", () => {
		expect(toCreateDashboardNoteRequest(formData({ dogID: 5, note: " Offsite " }))).toEqual({ dogID: 5, note: "Offsite" })
	})

	it("sends the typed name for a dog not listed", () => {
		expect(toCreateDashboardNoteRequest(formData({ dogName: " Waffles ", note: "Trial", notListed: true }))).toEqual({
			dogName: "Waffles",
			note: "Trial",
		})
	})

	it("only sends the last day when removing automatically", () => {
		expect(toCreateDashboardNoteRequest(formData({ dogID: 5, expires: true, note: "Trial", showUntil: "2026-10-31" }))).toEqual({
			dogID: 5,
			note: "Trial",
			showUntil: "2026-10-31",
		})
		expect(toCreateDashboardNoteRequest(formData({ dogID: 5, note: "Trial", showUntil: "2026-10-31" }))).toEqual({ dogID: 5, note: "Trial" })
	})
})

describe("DashboardNoteForm", () => {
	beforeEach(() => {
		useDashboardNoteFormState.getState().reset()
		useDashboardsState.setState({ refresh: vi.fn() })
		vi.spyOn(axios, "get").mockResolvedValue({ data: { options: [{ ID: 5, name: "Biscuit" }] }, status: 200 })
	})

	it("fills the note from the quick options", async () => {
		render(<DashboardNoteForm modalState={modalState} />)

		await userEvent.click(screen.getByRole("button", { name: "Trial" }))
		expect(useDashboardNoteFormState.getState().note).toBe("Trial")

		await userEvent.click(screen.getByRole("button", { name: "Offsite" }))
		expect(useDashboardNoteFormState.getState().note).toBe("Offsite")
	})

	it("swaps the dog lookup for a name field and posts the typed name", async () => {
		const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 201 })
		render(<DashboardNoteForm modalState={modalState} />)
		expect(screen.queryByRole("textbox", { name: "Dog" })).not.toBeInTheDocument()

		await userEvent.click(screen.getByText("Dog Not Listed"))
		await userEvent.type(screen.getAllByRole("textbox")[0], "Waffles")
		await userEvent.click(screen.getByRole("button", { name: "Offsite" }))
		await userEvent.click(screen.getByRole("button", { name: /submit/i }))

		expect(post).toHaveBeenCalledWith(
			expect.stringContaining("/DashboardNotes/CreateDashboardNote/"),
			{ dogName: "Waffles", note: "Offsite" },
			expect.anything()
		)
		expect(useDashboardsState.getState().refresh).toHaveBeenCalled()
	})

	it("needs a dog and a note", () => {
		const { setField } = useDashboardNoteFormState.getState()
		setField("note", "Offsite")
		expect(useDashboardNoteFormState.getState().isValid).toBe(false)

		setField("notListed", true)
		setField("dogName", "Waffles")
		expect(useDashboardNoteFormState.getState().isValid).toBe(true)

		setField("note", "  ")
		expect(useDashboardNoteFormState.getState().isValid).toBe(false)
	})

	it("needs today or a later date only when removing automatically", () => {
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date("2026-10-27T16:00:00Z"))
		const { setField } = useDashboardNoteFormState.getState()
		setField("dogID", 5)
		setField("note", "Trial")
		expect(useDashboardNoteFormState.getState().isValid).toBe(true)

		setField("expires", true)
		expect(useDashboardNoteFormState.getState().isValid).toBe(false)

		setField("showUntil", "2026-10-26")
		expect(useDashboardNoteFormState.getState().isValid).toBe(false)

		setField("showUntil", "2026-10-27")
		expect(useDashboardNoteFormState.getState().isValid).toBe(true)
		vi.useRealTimers()
	})

	it("shows the date picker only when removing automatically", async () => {
		render(<DashboardNoteForm modalState={modalState} />)
		expect(screen.queryByText("Last Day Shown")).not.toBeInTheDocument()

		await userEvent.click(screen.getByText("Remove Automatically"))

		// Untouched: required star only, no error icon yet
		const label = screen.getByText("Last Day Shown").closest("label")!
		expect(label.querySelector("[data-icon=star]")).not.toBeNull()
		expect(label.querySelector("[data-icon=circle-exclamation]")).toBeNull()
	})

	it("keeps the dog field in the same place when Dog Not Listed swaps it", async () => {
		render(<DashboardNoteForm modalState={modalState} />)
		const labelOrder = () => screen.getAllByText(/^(Dog|Dog Not Listed|Note)$/).map((el) => el.textContent)

		expect(labelOrder()).toEqual(["Dog", "Dog Not Listed", "Note"])
		await userEvent.click(screen.getByText("Dog Not Listed"))
		expect(labelOrder()).toEqual(["Dog", "Dog Not Listed", "Note"])
	})
})
