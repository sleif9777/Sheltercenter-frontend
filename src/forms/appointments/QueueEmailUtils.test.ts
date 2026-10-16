import { describe, expect, it } from "vitest"

import { QueueRow } from "../../api/appointments/Responses"
import { getEmailEntries, getQueuePositions, moveRow, toEditorRows } from "./QueueEmailUtils"

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
})
