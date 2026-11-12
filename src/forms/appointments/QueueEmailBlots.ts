import ReactQuill from "react-quill"

import {
	QUEUE_DOGS_BLOT,
	QUEUE_DOGS_CLASS,
	QUEUE_FIRST_NAME_BLOT,
	QUEUE_FIRST_NAME_CLASS,
	QUEUE_FIRST_NAME_TOKEN,
	QUEUE_NUMBER_BLOT,
	QUEUE_NUMBER_CLASS,
	QUEUE_NUMBER_DISPLAY,
} from "./QueueEmailUtils"

const Embed = ReactQuill.Quill.import("blots/embed")
const BlockEmbed = ReactQuill.Quill.import("blots/block/embed")

// The adopter's queue place as one uneditable chip, so the message is written around it
class QueueNumberBlot extends Embed {
	static blotName = QUEUE_NUMBER_BLOT
	static className = QUEUE_NUMBER_CLASS
	static tagName = "span"

	static create() {
		const node: HTMLElement = super.create()
		node.setAttribute("title", "Each adopter's place in the queue. This can't be removed.")
		node.textContent = QUEUE_NUMBER_DISPLAY
		return node
	}
}

// Each adopter's first name, filled in by the backend. Unlike the queue number, it can be deleted
class QueueFirstNameBlot extends Embed {
	static blotName = QUEUE_FIRST_NAME_BLOT
	static className = QUEUE_FIRST_NAME_CLASS
	static tagName = "span"

	static create() {
		const node: HTMLElement = super.create()
		node.setAttribute("title", "Each adopter's first name.")
		node.textContent = QUEUE_FIRST_NAME_TOKEN
		return node
	}
}

// The checked dogs, A-Z. Blocks Quill creates later (load, paste, undo) fill themselves from this
let queueDogNames: string[] = []

export function setQueueDogNames(names: string[], root: ParentNode) {
	queueDogNames = names
	root.querySelectorAll<HTMLElement>(`.${QUEUE_DOGS_CLASS}`).forEach((block) => fillDogsBlock(block, names))
}

// Shows the checked dogs as the email will list them
function fillDogsBlock(block: HTMLElement, names: string[]) {
	const list = document.createElement("ul")
	names.forEach((name) => {
		const item = document.createElement("li")
		const bold = document.createElement("b")
		bold.textContent = name
		item.append(bold)
		list.append(item)
	})
	block.replaceChildren(list)
}

// Where the popular dogs list goes; the backend swaps in the real list when sending
class QueueDogsBlot extends BlockEmbed {
	static blotName = QUEUE_DOGS_BLOT
	static className = QUEUE_DOGS_CLASS
	static tagName = "div"

	static create() {
		const node: HTMLElement = super.create()
		node.setAttribute("contenteditable", "false")
		node.setAttribute("title", "The popular dogs you check, listed A-Z. This can't be removed.")
		fillDogsBlock(node, queueDogNames)
		return node
	}
}

ReactQuill.Quill.register(QueueNumberBlot)
ReactQuill.Quill.register(QueueFirstNameBlot)
ReactQuill.Quill.register(QueueDogsBlot)
