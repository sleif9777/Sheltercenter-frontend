import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ModalState } from "../../core/components/modal/Modal"
import { plainTextToDelta } from "../../utils/QuillUtils"
import { useMessageFormState } from "./MessageFormState"
import { MessageForm, QuickText } from "./MessageForm"

// Quill doesn't run in jsdom, so type into a plain textarea instead
vi.mock("../../core/components/formInputs/RichTextInput", () => ({
	RichTextInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
		<textarea aria-label="Message" value={value} onChange={(e) => onChange(e.target.value)} />
	),
}))

// jsdom has no ResizeObserver, which the template picker's layout uses
globalThis.ResizeObserver ??= class {
	disconnect() {}
	observe() {}
	unobserve() {}
}

// The form's own submit button, not the chatbot answer's "Send my message to the team"
const SUBMIT = /^\s*(send|sending\.\.\.)\s*$/i

const modalState: ModalState = { close: vi.fn(), isOpen: true, open: vi.fn(), setIsOpen: vi.fn(), toggle: vi.fn() }

function chatbotStatus(enabled: boolean) {
	vi.spyOn(axios, "get").mockResolvedValue({ data: { enabled, questionsRemaining: null }, status: 200 })
}

function renderForm(quickTextOptions?: QuickText[]) {
	render(<MessageForm adopterID={4} hideSubject isMessageToAdoptions modalState={modalState} quickTextOptions={quickTextOptions} />)
}

async function send(text: string) {
	await userEvent.type(screen.getByRole("textbox", { name: "Message" }), text)
	await userEvent.click(screen.getByRole("button", { name: SUBMIT }))
}

describe("MessageForm chatbot", () => {
	beforeEach(() => {
		useMessageFormState.getState().reset()
		vi.mocked(modalState.close).mockClear()
	})

	it("shows the chatbot's answer and closes when the adopter accepts it", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValue({ data: { answer: "We don't hold dogs.", answered: true, interactionID: 9, questionsRemaining: null }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can you hold Biscuit?")

		expect(await screen.findByText("We don't hold dogs.")).toBeInTheDocument()
		expect(post).toHaveBeenCalledTimes(1)
		expect(post.mock.calls[0][0]).toBe("http://api.test/Chatbot/Ask/")
		expect(post.mock.calls[0][1]).toEqual({ adopterID: 4, question: "Can you hold Biscuit?" })
		expect(screen.queryByRole("button", { name: SUBMIT })).not.toBeInTheDocument()

		await userEvent.click(screen.getByRole("button", { name: "That answers my question" }))
		await vi.waitFor(() => expect(modalState.close).toHaveBeenCalled())
	})

	it("sends the message to staff when the adopter still needs help", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({ data: { answer: "We don't hold dogs.", answered: true, interactionID: 9, questionsRemaining: null }, status: 200 })
			.mockResolvedValueOnce({ data: {}, status: 204 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can you hold Biscuit?")
		await userEvent.click(await screen.findByRole("button", { name: "Send my message to the team" }))

		expect(post.mock.calls[1][0]).toBe("http://api.test/Chatbot/SendToStaff/")
		expect(post.mock.calls[1][1]).toEqual({ interactionID: 9 })
		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
	})

	it("shows the usual confirmation when the chatbot passes the message to staff", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValue({ data: { answer: "", answered: false, interactionID: 9, questionsRemaining: null }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Is Biscuit good with cats?")

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post).toHaveBeenCalledTimes(1)
	})

	it("sends straight to staff when the chatbot fails", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockRejectedValueOnce({ response: { data: {}, status: 500 } })
			.mockResolvedValueOnce({ data: {}, status: 204 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Hello?")

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post.mock.calls[1][0]).toBe("http://api.test/Adopters/MessageAdoptions/")
	})

	it("skips the chatbot for adopters without it", async () => {
		chatbotStatus(false)
		const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 204 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Hello?")

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post).toHaveBeenCalledTimes(1)
		expect(post.mock.calls[0][0]).toBe("http://api.test/Adopters/MessageAdoptions/")
	})

	it("skips the chatbot when a template is chosen", async () => {
		chatbotStatus(true)
		const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 204 })
		renderForm([{ label: "Visit my dog", templateContent: plainTextToDelta("I'd like to visit.\n"), value: 1 }])
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await userEvent.click(screen.getByRole("checkbox", { name: "Visit my dog" }))
		await userEvent.click(screen.getByRole("button", { name: SUBMIT }))

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post).toHaveBeenCalledTimes(1)
		expect(post.mock.calls[0][0]).toBe("http://api.test/Adopters/MessageAdoptions/")
	})
})
