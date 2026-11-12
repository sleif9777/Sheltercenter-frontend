import { QueueEmailEntry } from "../../api/appointments/Requests"
import { PopularDog, QueueRow } from "../../api/appointments/Responses"

export type QueueEditorRow = QueueRow & {
	included: boolean
}

/** Adopters already sent X in Queue start unchecked; checking them includes and re-emails them. */
export function toEditorRows(rows: QueueRow[]): QueueEditorRow[] {
	return rows.map((r) => ({ ...r, included: !r.alreadySent }))
}

/** Queue position (1-based) for each included row, keyed by appointment ID. Excluded rows don't take a number. */
export function getQueuePositions(rows: QueueEditorRow[]): Map<number, number> {
	const positions = new Map<number, number>()

	rows.filter((r) => r.included).forEach((r, i) => positions.set(r.apptID, i + 1))

	return positions
}

/** Every included row is emailed with its queue position. */
export function getEmailEntries(rows: QueueEditorRow[]): QueueEmailEntry[] {
	const positions = getQueuePositions(rows)

	return rows.filter((r) => r.included).map((r) => ({ apptID: r.apptID, position: positions.get(r.apptID)! }))
}

/** Filled in per adopter by the backend; a custom message must keep [NUMBER]. */
export const QUEUE_NUMBER_TOKEN = "[NUMBER]"
export const QUEUE_NUMBER_DISPLAY = `#${QUEUE_NUMBER_TOKEN}`
export const QUEUE_NUMBER_BLOT = "queueNumber"
export const QUEUE_NUMBER_CLASS = "ql-queue-number"

export function hasQueueNumber(message: string): boolean {
	return message.includes(QUEUE_NUMBER_TOKEN)
}

/** Filled in per adopter by the backend. */
export const QUEUE_FIRST_NAME_TOKEN = "[FIRST NAME]"
export const QUEUE_FIRST_NAME_BLOT = "queueFirstName"
export const QUEUE_FIRST_NAME_CLASS = "ql-queue-first-name"

/** Where the popular dogs list goes; the backend swaps it for the checked dogs, A-Z. */
export const QUEUE_DOGS_TOKEN = "[DOGS]"
export const QUEUE_DOGS_BLOT = "queueDogs"
export const QUEUE_DOGS_CLASS = "ql-queue-dogs"

/** Swaps #[NUMBER] (bold or not), [FIRST NAME] and [DOGS] for the editor's embeds. */
export function toEditorMessage(html: string): string {
	return html
		.replace(/<(b|strong)>#?\[NUMBER\]<\/\1>|#?\[NUMBER\]/g, `<span class="${QUEUE_NUMBER_CLASS}">${QUEUE_NUMBER_DISPLAY}</span>`)
		.replace(/\[FIRST NAME\]/g, `<span class="${QUEUE_FIRST_NAME_CLASS}">${QUEUE_FIRST_NAME_TOKEN}</span>`)
		.replace(/<p>\[DOGS\]<\/p>|\[DOGS\]/g, `<div class="${QUEUE_DOGS_CLASS}"></div>`)
}

/** Turns the editor's embeds back into the tokens the backend fills in. */
export function toEmailMessage(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html")

	doc.querySelectorAll(`.${QUEUE_NUMBER_CLASS}`).forEach((chip) => {
		const bold = doc.createElement("b")
		bold.textContent = QUEUE_NUMBER_DISPLAY
		chip.replaceWith(bold)
	})
	doc.querySelectorAll(`.${QUEUE_FIRST_NAME_CLASS}`).forEach((chip) => chip.replaceWith(QUEUE_FIRST_NAME_TOKEN))
	doc.querySelectorAll(`.${QUEUE_DOGS_CLASS}`).forEach((list) => list.replaceWith(QUEUE_DOGS_TOKEN))

	// Quill pads embeds with zero-width guard characters
	return doc.body.innerHTML.replace(/\uFEFF/g, "")
}

/** The popular dogs section (the paragraph leading into the list, if any, then the list) and where it sat. */
export type DogsSection = {
	html: string
	// How many top-level blocks came before it
	index: number
}

export type DogsSectionSplit = {
	html: string
	section?: DogsSection
}

export function hasDogsSection(html: string): boolean {
	return html.includes(QUEUE_DOGS_CLASS)
}

/** Pulls the dogs list and the paragraph right before it out of the message, keeping them to put back later. */
export function splitDogsSection(html: string): DogsSectionSplit {
	const doc = new DOMParser().parseFromString(html, "text/html")
	const list = doc.querySelector(`.${QUEUE_DOGS_CLASS}`)
	if (!list) {
		return { html }
	}

	const intro = list.previousElementSibling?.tagName == "P" ? list.previousElementSibling : null
	const first = intro ?? list
	const index = [...doc.body.children].indexOf(first)
	// The names inside are only a preview, so keep the list empty
	list.replaceChildren()
	const sectionHTML = (intro?.outerHTML ?? "") + list.outerHTML
	intro?.remove()
	list.remove()

	return { html: doc.body.innerHTML, section: { html: sectionHTML, index } }
}

/** Puts the dogs section back where it was, or at the end if the message has since gotten shorter. */
export function addDogsSection(html: string, section?: DogsSection): string {
	const doc = new DOMParser().parseFromString(html, "text/html")
	const template = doc.createElement("template")
	template.innerHTML = section?.html ?? `<div class="${QUEUE_DOGS_CLASS}"></div>`

	const before = section ? doc.body.children[section.index] : undefined
	if (before) {
		before.before(template.content)
	} else {
		doc.body.append(template.content)
	}

	return doc.body.innerHTML
}

/** A dog that may be listed as popular. Watchers is unset for dogs added by name. */
export type QueueDogRow = {
	dogID: number
	included: boolean
	name: string
	watchers?: number
}

/** Watchlist dogs start unchecked so nothing is listed unless a superuser picks it. */
export function toDogRows(dogs: PopularDog[]): QueueDogRow[] {
	return dogs.map((d) => ({ ...d, included: false }))
}

/** Adds a dog picked by name, checked. A dog already listed is just checked. */
export function addDogRow(rows: QueueDogRow[], dog: { dogID: number; name: string }): QueueDogRow[] {
	if (rows.some((r) => r.dogID === dog.dogID)) {
		return rows.map((r) => (r.dogID === dog.dogID ? { ...r, included: true } : r))
	}

	return [...rows, { ...dog, included: true }]
}

export function getIncludedDogIDs(rows: QueueDogRow[]): number[] {
	return rows.filter((r) => r.included).map((r) => r.dogID)
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
