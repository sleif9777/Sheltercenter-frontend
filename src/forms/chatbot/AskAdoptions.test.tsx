import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AskAdoptions } from "./AskAdoptions"

const messageForm = vi.fn((initialValue?: string) => <div data-testid="message-form">{initialValue}</div>)
const onDone = vi.fn()

function status(enabled: boolean, questionsRemaining = 5) {
	vi.spyOn(axios, "get").mockResolvedValue({ data: { enabled, questionsRemaining }, status: 200 })
}

function renderAsk() {
	render(<AskAdoptions adopterID={4} messageForm={messageForm} onDone={onDone} />)
}

async function askQuestion(text: string) {
	await userEvent.type(await screen.findByRole("textbox", { name: "Your question" }), text)
	await userEvent.click(screen.getByRole("button", { name: "Ask" }))
}

describe("AskAdoptions", () => {
	beforeEach(() => {
		messageForm.mockClear()
		onDone.mockClear()
	})

	it("shows the regular form to adopters without the chatbot", async () => {
		status(false)
		renderAsk()

		expect(screen.getByTestId("message-form")).toBeInTheDocument()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())
		expect(screen.queryByRole("textbox", { name: "Your question" })).not.toBeInTheDocument()
		expect(screen.getByTestId("message-form")).toBeInTheDocument()
	})

	it("shows an answer and sends it to staff on request", async () => {
		status(true, 3)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({ data: { answer: "We don't hold dogs.", answered: true, interactionID: 9, questionsRemaining: 2 }, status: 200 })
			.mockResolvedValueOnce({ data: {}, status: 204 })
		renderAsk()

		expect(await screen.findByText("You can ask 3 more questions today.")).toBeInTheDocument()
		await askQuestion("Can you hold Biscuit?")

		expect(await screen.findByText("We don't hold dogs.")).toBeInTheDocument()
		expect(post.mock.calls[0][1]).toEqual({ adopterID: 4, question: "Can you hold Biscuit?" })

		await userEvent.click(screen.getByRole("button", { name: "I still need help" }))
		expect(post.mock.calls[1][0]).toBe("http://api.test/Chatbot/SendToStaff/")
		expect(post.mock.calls[1][1]).toEqual({ interactionID: 9 })
		expect(await screen.findByText(/We've sent your question to our team/)).toBeInTheDocument()
	})

	it("tells the adopter when the question went to staff", async () => {
		status(true)
		vi.spyOn(axios, "post").mockResolvedValue({ data: { answer: "", answered: false, interactionID: 9, questionsRemaining: 4 }, status: 200 })
		renderAsk()

		await askQuestion("Is Biscuit good with cats?")

		expect(await screen.findByText(/We don't have an automatic answer for that/)).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		expect(onDone).toHaveBeenCalled()
	})

	it("falls back to the form with the question filled in past the daily cap", async () => {
		status(true)
		vi.spyOn(axios, "post").mockRejectedValue({ response: { data: { questionsRemaining: 0 }, status: 429 } })
		renderAsk()

		await askQuestion("Hi <there>")

		expect(await screen.findByText(/reached today's limit/)).toBeInTheDocument()
		expect(messageForm).toHaveBeenLastCalledWith("<p>Hi &lt;there&gt;</p>")
	})

	it("goes straight to the form when no questions are left today", async () => {
		status(true, 0)
		renderAsk()

		expect(await screen.findByText(/reached today's limit/)).toBeInTheDocument()
		expect(screen.getByTestId("message-form")).toBeInTheDocument()
	})
})
