import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChatbotAnswer } from "./ChatbotAnswer"

function renderAnswer(answer: string, sentToStaff = false) {
	const onAccept = vi.fn()
	render(<ChatbotAnswer answer={answer} sentToStaff={sentToStaff} onAccept={onAccept} onSendToStaff={vi.fn()} />)
	return onAccept
}

describe("ChatbotAnswer", () => {
	it("links to pages on the site in a new tab", () => {
		renderAnswer("Add them to your [watchlist](/watchlist/) today.")

		const link = screen.getByRole("link", { name: "watchlist" })
		expect(link).toHaveAttribute("href", "/watchlist/")
		expect(link).toHaveAttribute("target", "_blank")
		expect(screen.getByText(/Add them to your/).textContent).toBe("Add them to your watchlist today.")
	})

	it("after a partial answer, says the team will follow up and only offers to close", async () => {
		const onAccept = renderAnswer("Micah can come and sign with his ID.", true)

		expect(screen.getByText(/We've also sent your message to our team/)).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Send my message to the team" })).not.toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		expect(onAccept).toHaveBeenCalled()
	})

	it("shows other links as plain text", () => {
		renderAnswer("See [this site](https://example.invalid/) or [that one](//example.invalid/).")

		expect(screen.queryByRole("link")).not.toBeInTheDocument()
		expect(screen.getByText(/See this site or that one\./)).toBeInTheDocument()
	})
})
