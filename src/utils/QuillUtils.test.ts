import { describe, expect, it } from "vitest"

import { messageToPlainText, plainTextToDelta } from "./QuillUtils"

describe("messageToPlainText", () => {
	it("puts each paragraph and line break of editor HTML on its own line", () => {
		expect(messageToPlainText("<p>Hi there,</p><p><br></p><p>Can I visit <strong>Biscuit</strong>?<br>Thanks &amp; bye</p>")).toBe(
			"Hi there,\n\nCan I visit Biscuit?\nThanks & bye"
		)
	})

	it("reads a Quill delta", () => {
		expect(messageToPlainText(plainTextToDelta("Hello\n"))).toBe("Hello")
	})
})
