import { describe, expect, it } from "vitest"

import { QueueRow } from "../../api/appointments/Responses"
import {
	addDogRow,
	addDogsSection,
	getEmailEntries,
	getIncludedDogIDs,
	getQueuePositions,
	hasQueueNumber,
	moveRow,
	splitDogsSection,
	toDogRows,
	toEditorMessage,
	toEditorRows,
	toEmailMessage,
} from "./QueueEmailUtils"

function row(apptID: number, alreadySent = false): QueueRow {
	return {
		adopterName: `Adopter ${apptID}`,
		alreadySent,
		apptID,
		bookedDisplay: "",
		timeDisplay: "12:00 PM",
		typeDisplay: "ADULTS",
	}
}

describe("QueueEmailUtils", () => {
	it("numbers included rows in order and skips excluded ones", () => {
		const rows = toEditorRows([row(1), row(2), row(3)])
		rows[1].included = false

		const positions = getQueuePositions(rows)

		expect(positions.get(1)).toBe(1)
		expect(positions.has(2)).toBe(false)
		expect(positions.get(3)).toBe(2)
	})

	it("starts already-sent adopters unchecked and emails every checked row", () => {
		const rows = toEditorRows([row(1, true), row(2), row(3, true)])

		expect(rows.map((r) => r.included)).toEqual([false, true, false])
		expect(getEmailEntries(rows)).toEqual([{ apptID: 2, position: 1 }])

		rows[2].included = true
		expect(getEmailEntries(rows)).toEqual([
			{ apptID: 2, position: 1 },
			{ apptID: 3, position: 2 },
		])
	})

	it("reorders rows and leaves out-of-range moves alone", () => {
		const rows = [1, 2, 3, 4]

		expect(moveRow(rows, 3, 0)).toEqual([4, 1, 2, 3])
		expect(moveRow(rows, 0, 2)).toEqual([2, 3, 1, 4])
		expect(moveRow(rows, 0, 9)).toBe(rows)
	})

	it("starts watchlist dogs unchecked and adds dogs picked by name checked", () => {
		const rows = toDogRows([
			{ dogID: 1, name: "Luna", watchers: 3 },
			{ dogID: 2, name: "Biscuit", watchers: 1 },
		])

		expect(getIncludedDogIDs(rows)).toEqual([])

		const withPicked = addDogRow(rows, { dogID: 9, name: "Max" })
		expect(withPicked.map((r) => r.name)).toEqual(["Luna", "Biscuit", "Max"])
		expect(getIncludedDogIDs(withPicked)).toEqual([9])

		// Picking a dog that's already listed checks it instead of adding it twice
		expect(getIncludedDogIDs(addDogRow(withPicked, { dogID: 1, name: "Luna" }))).toEqual([1, 9])
	})

	it("requires [NUMBER] in a custom message", () => {
		expect(hasQueueNumber("<p>You are #[NUMBER] in the queue [DAY]</p>")).toBe(true)
		expect(hasQueueNumber("<p>You are next in the queue</p>")).toBe(false)
	})

	it("swaps #[NUMBER] for the locked chip and back again for the email", () => {
		const chip = '<span class="ql-queue-number">#[NUMBER]</span>'

		expect(toEditorMessage("<p>You are <b>#[NUMBER]</b> in the queue.</p>")).toBe(`<p>You are ${chip} in the queue.</p>`)
		expect(toEditorMessage("<p>Spot [NUMBER] or <strong>#[NUMBER]</strong></p>")).toBe(`<p>Spot ${chip} or ${chip}</p>`)

		// How Quill renders the chip, guard characters and all
		const fromQuill = '<p>You are <span class="ql-queue-number">\uFEFF<span contenteditable="false">#[NUMBER]</span>\uFEFF</span> in the queue.</p>'
		expect(toEmailMessage(fromQuill)).toBe("<p>You are <b>#[NUMBER]</b> in the queue.</p>")

		const dogsBlock = '<div class="ql-queue-dogs"></div>'
		expect(toEditorMessage("<p>Popular:</p>[DOGS]")).toBe(`<p>Popular:</p>${dogsBlock}`)
		expect(toEditorMessage("<p>Popular:</p><p>[DOGS]</p>")).toBe(`<p>Popular:</p>${dogsBlock}`)
		expect(toEmailMessage('<p>Popular:</p><div class="ql-queue-dogs" contenteditable="false"><ul><li><b>Luna</b></li></ul></div>')).toBe(
			"<p>Popular:</p>[DOGS]"
		)
	})

	it("splits off the dogs list with the paragraph before it, and puts it back where it was", () => {
		const list = '<div class="ql-queue-dogs" contenteditable="false"><ul><li><b>Luna</b></li></ul></div>'
		const { html, section } = splitDogsSection(`<p>Hi</p><p>Popular:</p>${list}<p>Kind regards,</p>`)

		expect(html).toBe("<p>Hi</p><p>Kind regards,</p>")
		expect(section).toEqual({ html: '<p>Popular:</p><div class="ql-queue-dogs" contenteditable="false"></div>', index: 1 })
		expect(addDogsSection(html, section)).toBe(`<p>Hi</p>${section!.html}<p>Kind regards,</p>`)
		// The message got shorter while it was hidden, so it goes at the end
		expect(addDogsSection("<p>Hi</p>", { ...section!, index: 5 })).toBe(`<p>Hi</p>${section!.html}`)
		expect(splitDogsSection("<p>No list</p>")).toEqual({ html: "<p>No list</p>" })
	})

	it("swaps [FIRST NAME] for a chip and back", () => {
		const editor = toEditorMessage("<p>Hi [FIRST NAME],</p>")

		expect(editor).toBe('<p>Hi <span class="ql-queue-first-name">[FIRST NAME]</span>,</p>')
		expect(toEmailMessage(editor)).toBe("<p>Hi [FIRST NAME],</p>")
	})
})
