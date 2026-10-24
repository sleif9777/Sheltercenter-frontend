import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CardActionAreYouSure } from "./CardActionAreYouSure"
import { CardActionSection } from "./CardActionSection"
import { CardColor } from "./CardEnums"

describe("CardActionSection dropdown", () => {
	beforeEach(() => {
		// Tooltips on the action buttons need ResizeObserver (missing from jsdom)
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			}
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("keeps a confirmation modal opened from the dropdown alive until it is submitted", async () => {
		const onSubmit = vi.fn()
		render(
			<CardActionSection color={CardColor.BLUE}>
				<CardActionAreYouSure icon={faTrash} modalTitle="Delete" youWantTo="delete this" onSubmit={onSubmit} />
			</CardActionSection>
		)

		// The last button is the ellipsis that opens the small-screen dropdown
		const buttons = screen.getAllByRole("button")
		await userEvent.click(buttons[buttons.length - 1])
		const dropdownAction = screen.getAllByRole("button").find((b) => b.querySelector("[data-icon=trash]") && !buttons.includes(b))
		await userEvent.click(dropdownAction!)

		// Portaled out of the dropdown, which would otherwise treat clicks in the modal as inside it
		const dropdown = dropdownAction!.closest(".absolute")!
		expect(dropdown.contains(screen.getByRole("dialog"))).toBe(false)

		await userEvent.click(screen.getByText("Continue"))
		expect(onSubmit).toHaveBeenCalled()
	})
})
