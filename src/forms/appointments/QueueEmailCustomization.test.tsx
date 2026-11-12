import { act, render, renderHook, waitFor } from "@testing-library/react"
import ReactQuill from "react-quill"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { QueueMessageEditor, useQueueMessage } from "./QueueEmailCustomization"
import { QUEUE_DOGS_BLOT, QUEUE_DOGS_CLASS, QUEUE_NUMBER_BLOT, QUEUE_NUMBER_CLASS, toEditorMessage, toEmailMessage } from "./QueueEmailUtils"

type Editor = InstanceType<typeof ReactQuill.Quill>

const RAW_DEFAULT =
	"<p>Hi [FIRST NAME],</p><p>You are <b>#[NUMBER]</b> in the queue today.</p><p>Many visitors today are hoping to meet these dogs:</p>[DOGS]<p>Kind regards,</p>"
const DEFAULT_MESSAGE = toEditorMessage(RAW_DEFAULT)

// jsdom doesn't lay out ranges, which Quill measures when it moves the cursor
beforeAll(() => {
	Range.prototype.getBoundingClientRect = () => new DOMRect()
	Range.prototype.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList
})

function getEditor(container: HTMLElement): Editor {
	return ReactQuill.Quill.find(container.querySelector(".ql-container")!) as Editor
}

function indexOfEmbed(editor: Editor, blotName: string): number {
	let index = 0
	for (const op of editor.getContents().ops ?? []) {
		if (typeof op.insert === "object" && blotName in op.insert) {
			return index
		}
		index += typeof op.insert === "string" ? op.insert.length : 1
	}
	return -1
}

function renderEditor(popularDogNames: string[]) {
	const props = { isDefault: true, message: DEFAULT_MESSAGE, onReset: vi.fn(), setMessage: vi.fn() }
	return render(<QueueMessageEditor {...props} popularDogNames={popularDogNames} />)
}

describe("QueueMessageEditor", () => {
	it("locks the queue number and dogs list but allows editing around them", async () => {
		const { container } = renderEditor([])
		await waitFor(() => expect(container.querySelector(`.${QUEUE_DOGS_CLASS}`)).not.toBeNull())
		const editor = getEditor(container)

		for (const [blotName, className] of [
			[QUEUE_NUMBER_BLOT, QUEUE_NUMBER_CLASS],
			[QUEUE_DOGS_BLOT, QUEUE_DOGS_CLASS],
		]) {
			editor.deleteText(indexOfEmbed(editor, blotName), 1, "user")
			expect(container.querySelector(`.${className}`)).not.toBeNull()
		}

		editor.insertText(0, "Hi! ", "user")
		expect(editor.getText()).toMatch(/^Hi! Hi /)

		const email = toEmailMessage(editor.root.innerHTML)
		expect(email).toContain("<b>#[NUMBER]</b>")
		expect(email).toContain("these dogs:</p>[DOGS]")
		expect(email).toContain("<p>Hi! Hi [FIRST NAME],</p>")
	})

	it("lists checked dogs A-Z in the locked block", async () => {
		const { container } = renderEditor(["Max", "Luna"])
		await waitFor(() => expect(container.querySelectorAll(`.${QUEUE_DOGS_CLASS} li`)).toHaveLength(2))

		const names = [...container.querySelectorAll(`.${QUEUE_DOGS_CLASS} li`)].map((li) => li.textContent)
		expect(names).toEqual(["Luna", "Max"])

		// The names are only a preview; the backend fills in the real list
		expect(toEmailMessage(getEditor(container).root.innerHTML)).not.toContain("Luna")
	})
})

describe("useQueueMessage", () => {
	it("shows the popular dogs section only while a dog is checked, keeping its wording", () => {
		const { result, rerender } = renderHook(({ hasDogs }) => useQueueMessage(hasDogs), { initialProps: { hasDogs: false } })
		act(() => result.current.loadDefault(RAW_DEFAULT))

		expect(toEmailMessage(result.current.message)).toBe(
			"<p>Hi [FIRST NAME],</p><p>You are <b>#[NUMBER]</b> in the queue today.</p><p>Kind regards,</p>"
		)
		expect(result.current.isDefault).toBe(true)

		act(() => result.current.showDogsSection(true))
		rerender({ hasDogs: true })
		expect(toEmailMessage(result.current.message)).toBe(toEmailMessage(DEFAULT_MESSAGE))
		expect(result.current.isDefault).toBe(true)

		// Reword the intro, uncheck the last dog, then check one again
		act(() => result.current.setMessage(result.current.message.replace("Many visitors", "Lots of folks")))
		act(() => result.current.showDogsSection(false))
		rerender({ hasDogs: false })
		expect(result.current.message).not.toContain("Lots of folks")

		act(() => result.current.showDogsSection(true))
		rerender({ hasDogs: true })
		// Back where it was, above the sign-off
		expect(toEmailMessage(result.current.message)).toContain("<p>Lots of folks today are hoping to meet these dogs:</p>[DOGS]<p>Kind regards,</p>")
		expect(result.current.isDefault).toBe(false)

		act(() => result.current.reset())
		expect(toEmailMessage(result.current.message)).toBe(toEmailMessage(DEFAULT_MESSAGE))
	})
})
