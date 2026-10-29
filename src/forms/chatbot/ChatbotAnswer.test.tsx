import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ChatbotAnswer } from "./ChatbotAnswer"

function renderAnswer(answer: string) {
	render(<ChatbotAnswer answer={answer} onAccept={vi.fn()} onSendToStaff={vi.fn()} />)
}

describe("ChatbotAnswer", () => {
	it("links to pages on the site in a new tab", () => {
		renderAnswer("Add them to your [watchlist](/watchlist/) today.")

		const link = screen.getByRole("link", { name: "watchlist" })
		expect(link).toHaveAttribute("href", "/watchlist/")
		expect(link).toHaveAttribute("target", "_blank")
		expect(screen.getByText(/Add them to your/).textContent).toBe("Add them to your watchlist today.")
	})

	it("shows other links as plain text", () => {
		renderAnswer("See [this site](https://example.invalid/) or [that one](//example.invalid/).")

		expect(screen.queryByRole("link")).not.toBeInTheDocument()
		expect(screen.getByText(/See this site or that one\./)).toBeInTheDocument()
	})
})
