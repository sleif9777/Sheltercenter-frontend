import { QueueEmailEntry } from "../../api/appointments/Requests"
import { QueueRow } from "../../api/appointments/Responses"

export type QueueEditorRow = QueueRow & {
	included: boolean
	resend: boolean
}

export function toEditorRows(rows: QueueRow[]): QueueEditorRow[] {
	return rows.map((r) => ({ ...r, included: true, resend: false }))
}

/** Queue position (1-based) for each included row, keyed by appointment ID. Excluded rows don't take a number. */
export function getQueuePositions(rows: QueueEditorRow[]): Map<number, number> {
	const positions = new Map<number, number>()

	rows.filter((r) => r.included).forEach((r, i) => positions.set(r.apptID, i + 1))

	return positions
}

/** Included rows to email: anyone not already sent, plus already-sent rows explicitly marked to resend. */
export function getEmailEntries(rows: QueueEditorRow[]): QueueEmailEntry[] {
	const positions = getQueuePositions(rows)

	return rows.filter((r) => r.included && (!r.alreadySent || r.resend)).map((r) => ({ apptID: r.apptID, position: positions.get(r.apptID)! }))
}

export function moveRow<T>(rows: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) {
		return rows
	}

	const next = [...rows]
	const [moved] = next.splice(from, 1)
	next.splice(to, 0, moved)

	return next
}
