import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import ChangeLogApp from "./ChangeLogApp"
import { CHANGE_LOG_ENTRIES } from "./ChangeLogEntries"

function renderPage() {
	render(
		<MemoryRouter>
			<ChangeLogApp />
		</MemoryRouter>
	)
}

describe("ChangeLogApp", () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it("lists every entry under its date, newest date first", () => {
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date("2026-10-27T16:00:00Z"))
		renderPage()
		for (const entry of CHANGE_LOG_ENTRIES) {
			expect(screen.getByText(entry.title)).toBeVisible()
		}
		const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)
		expect(headings[0]).toBe("Oct 27, 2026")
		expect(headings[headings.length - 1]).toBe("Oct 1, 2026")
		expect(screen.queryByText("Older Changes")).not.toBeInTheDocument()
	})

	it("collapses entries older than 60 days under Older Changes", async () => {
		// Cutoff is 2026-10-03: Oct 3 stays visible, Oct 1 is older
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date("2026-12-02T16:00:00Z"))
		renderPage()
		const recentTitle = "Bookings the server rejected are no longer shown as confirmed"
		const olderTitle = "Visit time slot requests require 3 hours' notice"

		expect(screen.getByText(recentTitle)).toBeVisible()
		expect(screen.getByText(olderTitle)).not.toBeVisible()

		await userEvent.click(screen.getByText("Older Changes"))
		expect(screen.getByText(olderTitle)).toBeVisible()
	})
})
