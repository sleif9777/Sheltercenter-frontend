import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ModalState } from "../../core/components/modal/Modal"
import { plainTextToDelta } from "../../utils/QuillUtils"
import { useMessageFormState } from "./MessageFormState"
import { MessageForm, QuickText } from "./MessageForm"

// Quill doesn't run in jsdom, so type into a plain textarea instead. Templates are Quill deltas, which this
// stand-in can't display, so it shows them empty, like the Blank Template.
vi.mock("../../core/components/formInputs/RichTextInput", () => ({
	RichTextInput: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
		<textarea aria-label="Message" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
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
			.mockResolvedValue({ data: { answer: "We don't hold dogs.", interactionID: 9, sentToStaff: false, questionsRemaining: null }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can you hold Biscuit?")

		expect(await screen.findByText("We don't hold dogs.")).toBeInTheDocument()
		expect(post).toHaveBeenCalledTimes(1)
		expect(post.mock.calls[0][0]).toBe("http://api.test/Chatbot/Ask/")
		expect(post.mock.calls[0][1]).toEqual({ adopterID: 4, message: "Can you hold Biscuit?", question: "Can you hold Biscuit?" })
		expect(screen.queryByRole("button", { name: SUBMIT })).not.toBeInTheDocument()

		await userEvent.click(screen.getByRole("button", { name: "That answers my question" }))
		await vi.waitFor(() => expect(modalState.close).toHaveBeenCalled())
	})

	it("shows a partial answer and says the message went to the team", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValue({ data: { answer: "Micah can come and sign.", interactionID: 9, questionsRemaining: null, sentToStaff: true }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can Micah come on Wednesday?")

		expect(await screen.findByText("Micah can come and sign.")).toBeInTheDocument()
		expect(screen.getByText(/We've also sent your message to our team/)).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		await vi.waitFor(() => expect(modalState.close).toHaveBeenCalled())
		expect(post).toHaveBeenCalledTimes(1)
	})

	it("moves the appointment when the adopter takes the offered time", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({
				data: {
					answer: "4:30 PM is open.",
					interactionID: 9,
					offer: { label: "Wednesday, October 28 at 4:30 PM" },
					questionsRemaining: null,
					sentToStaff: false,
				},
				status: 200,
			})
			.mockResolvedValueOnce({ data: { label: "Wednesday, October 28 at 4:30 PM" }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can I switch back to 4:30?")
		await userEvent.click(await screen.findByRole("button", { name: "Yes, reschedule my appointment" }))

		expect(post.mock.calls[1][0]).toBe("http://api.test/Chatbot/AcceptOffer/")
		expect(post.mock.calls[1][1]).toEqual({ interactionID: 9 })
		expect(await screen.findByText(/All set! Your appointment is now/)).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		await vi.waitFor(() => expect(modalState.close).toHaveBeenCalled())
	})

	it("drops the offer if the time was taken before the adopter accepted", async () => {
		chatbotStatus(true)
		vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({
				data: { answer: "4:30 PM is open.", interactionID: 9, offer: { label: "4:30 PM" }, questionsRemaining: null, sentToStaff: false },
				status: 200,
			})
			.mockRejectedValueOnce({ response: { data: {}, status: 409 } })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Can I switch back to 4:30?")
		await userEvent.click(await screen.findByRole("button", { name: "Yes, reschedule my appointment" }))

		await vi.waitFor(() => expect(screen.queryByRole("button", { name: "Yes, reschedule my appointment" })).not.toBeInTheDocument())
		expect(screen.getByText("4:30 PM is open.")).toBeInTheDocument()
	})

	it("cancels the appointment when the adopter confirms", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({
				data: {
					answer: "You can cancel with the button below.",
					interactionID: 9,
					offer: null,
					offerCancel: { label: "Saturday, October 31 at 1:00 PM" },
					questionsRemaining: null,
					sentToStaff: false,
				},
				status: 200,
			})
			.mockResolvedValueOnce({ data: { label: "Saturday, October 31 at 1:00 PM" }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Please cancel my appointment")
		expect(await screen.findByRole("button", { name: "Never Mind" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "That answers my question" })).not.toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Yes, cancel my appointment" }))

		expect(post.mock.calls[1][0]).toBe("http://api.test/Chatbot/AcceptCancellation/")
		expect(post.mock.calls[1][1]).toEqual({ interactionID: 9 })
		expect(await screen.findByText(/is canceled/)).toBeInTheDocument()
	})

	it("closes without changes when the adopter says never mind", async () => {
		chatbotStatus(true)
		const post = vi.spyOn(axios, "post").mockResolvedValueOnce({
			data: {
				answer: "You can cancel below.",
				interactionID: 9,
				offer: null,
				offerCancel: { label: "Oct 31" },
				questionsRemaining: null,
				sentToStaff: false,
			},
			status: 200,
		})
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Please cancel my appointment")
		await userEvent.click(await screen.findByRole("button", { name: "Never Mind" }))

		await vi.waitFor(() => expect(modalState.close).toHaveBeenCalled())
		expect(post).toHaveBeenCalledTimes(1)
	})

	it("lets the adopter reply to a follow-up question in place", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({
				data: { answer: "Which day would you like?", awaitingReply: true, interactionID: 9, offer: null, offerCancel: null, sentToStaff: false },
				status: 200,
			})
			.mockResolvedValueOnce({
				data: {
					answer: "Friday at 3 PM is open.",
					awaitingReply: false,
					interactionID: 10,
					offer: { label: "Friday, November 6 at 3:00 PM" },
					offerCancel: null,
					sentToStaff: false,
				},
				status: 200,
			})
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("I want to reschedule for 3pm")
		await userEvent.type(await screen.findByRole("textbox", { name: "Your reply" }), "Friday")
		await userEvent.click(screen.getByRole("button", { name: "Send reply" }))

		expect(post.mock.calls[1][0]).toBe("http://api.test/Chatbot/Ask/")
		expect(post.mock.calls[1][1]).toEqual({ adopterID: 4, previousInteractionID: 9, question: "Friday" })
		expect(await screen.findByText("Friday at 3 PM is open.")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Yes, reschedule my appointment" })).toBeInTheDocument()
	})

	it("sends the message to staff when the adopter still needs help", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({ data: { answer: "We don't hold dogs.", interactionID: 9, sentToStaff: false, questionsRemaining: null }, status: 200 })
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
			.mockResolvedValue({ data: { answer: "", interactionID: 9, sentToStaff: true, questionsRemaining: null }, status: 200 })
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

	it("forgets a template chosen the last time the form was open", async () => {
		chatbotStatus(true)
		useMessageFormState.getState().setField("templateFlag", 1)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValue({ data: { answer: "", interactionID: 9, sentToStaff: true, questionsRemaining: null }, status: 200 })
		renderForm()
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await send("Hello?")

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post.mock.calls[0][0]).toBe("http://api.test/Chatbot/Ask/")
	})

	it("asks the chatbot when the Blank Template is chosen", async () => {
		chatbotStatus(true)
		const post = vi
			.spyOn(axios, "post")
			.mockResolvedValue({ data: { answer: "", interactionID: 9, sentToStaff: true, questionsRemaining: null }, status: 200 })
		renderForm([{ label: "Blank Template", templateContent: plainTextToDelta(""), value: 0 }])
		await vi.waitFor(() => expect(axios.get).toHaveBeenCalled())

		await userEvent.click(screen.getByRole("checkbox", { name: "Blank Template" }))
		await send("Can I bring my kids?")

		expect(await screen.findByText(/Your message was sent!/)).toBeInTheDocument()
		expect(post.mock.calls[0][0]).toBe("http://api.test/Chatbot/Ask/")
		expect(post.mock.calls[0][1]).toEqual({ adopterID: 4, message: "Can I bring my kids?", question: "Can I bring my kids?" })
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
