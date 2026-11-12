import { setQueueDogNames } from "./QueueEmailBlots"

import { faRotateLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { DogsAPI } from "../../api/dogs/DogsAPI"
import CheckboxGroupInput from "../../core/components/formInputs/CheckboxGroupInput"
import { RichTextInput } from "../../core/components/formInputs/RichTextInput"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import {
	addDogRow,
	addDogsSection,
	DogsSection,
	DogsSectionSplit,
	hasDogsSection,
	hasQueueNumber,
	QUEUE_DOGS_BLOT,
	QUEUE_DOGS_CLASS,
	QUEUE_FIRST_NAME_CLASS,
	QUEUE_NUMBER_BLOT,
	QUEUE_NUMBER_CLASS,
	QUEUE_NUMBER_TOKEN,
	QueueDogRow,
	splitDogsSection,
	toEditorMessage,
	toEmailMessage,
} from "./QueueEmailUtils"

// Stable reference so the editor's lock isn't re-attached every render
const LOCKED_EMBEDS = [QUEUE_NUMBER_BLOT, QUEUE_DOGS_BLOT]

/**
 * The queue message. The popular dogs section (the paragraph leading into the list, then the list) is only in the
 * message while a dog is checked; its wording is kept while it's hidden.
 */
export function useQueueMessage(hasDogs: boolean) {
	const [message, setMessage] = useState("")
	const [defaultParts, setDefaultParts] = useState<DogsSectionSplit>()
	const sectionRef = useRef<DogsSection | undefined>(undefined)

	const loadDefault = useCallback((defaultMessage: string) => {
		const parts = splitDogsSection(toEditorMessage(defaultMessage))
		sectionRef.current = parts.section
		setDefaultParts(parts)
		setMessage(parts.html)
	}, [])

	const showDogsSection = useCallback(
		(show: boolean) => {
			if (show == hasDogsSection(message)) {
				return
			}

			if (show) {
				setMessage(addDogsSection(message, sectionRef.current))
			} else {
				const parts = splitDogsSection(message)
				sectionRef.current = parts.section
				setMessage(parts.html)
			}
		},
		[message]
	)

	const defaultForDogs = defaultParts && (hasDogs ? addDogsSection(defaultParts.html, defaultParts.section) : defaultParts.html)

	const reset = useCallback(() => {
		if (defaultParts && defaultForDogs != null) {
			sectionRef.current = defaultParts.section
			setMessage(defaultForDogs)
		}
	}, [defaultForDogs, defaultParts])

	return {
		hasDefault: defaultParts != null,
		// Compared as sent, since the editor rewrites the HTML and fills in the dogs preview
		isDefault: defaultForDogs != null && toEmailMessage(message) == toEmailMessage(defaultForDogs),
		loadDefault,
		message,
		reset,
		setMessage,
		showDogsSection,
	}
}

export function QueueMessageEditor({
	isDefault,
	message,
	popularDogNames,
	setMessage,
	onReset,
}: {
	isDefault: boolean
	message: string
	popularDogNames: string[]
	setMessage: (message: string) => void
	onReset: () => void
}) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const sortedNames = useMemo(() => [...popularDogNames].sort((a, b) => a.localeCompare(b)), [popularDogNames])

	// Quill owns the dogs block, so its contents are filled in outside React
	useEffect(() => {
		setQueueDogNames(sortedNames, wrapperRef.current ?? document)
	}, [sortedNames])

	return (
		<div className="flex flex-col gap-y-2" ref={wrapperRef}>
			<style>{`
				/* Space paragraphs the way the email will */
				.queue-message .ql-editor p:not(:last-child),
				.queue-message .ql-editor .${QUEUE_DOGS_CLASS}:not(:last-child) {
					margin-bottom: 1em;
				}

				.${QUEUE_NUMBER_CLASS} > span[contenteditable],
				.${QUEUE_FIRST_NAME_CLASS} > span[contenteditable] {
					background-color: #fce7f3;
					border: 1px solid #be185d;
					border-radius: 4px;
					color: #9d174d;
					cursor: default;
					font-weight: 700;
					padding: 0 4px;
					white-space: nowrap;
				}

				.ql-editor .${QUEUE_DOGS_CLASS} {
					background-color: #fdf2f8;
					border: 1px dashed #be185d;
					border-radius: 4px;
					cursor: default;
					padding: 4px 8px;
					user-select: none;
				}

				.ql-editor .${QUEUE_DOGS_CLASS} ul {
					padding-left: 0;
				}
			`}</style>
			<div className="queue-message">
				<RichTextInput
					errors={hasQueueNumber(message) ? undefined : [`Add ${QUEUE_NUMBER_TOKEN} so adopters see their place in the queue.`]}
					fieldLabel="Message"
					lockedEmbeds={LOCKED_EMBEDS}
					showRequired
					value={message}
					onChange={(v) => setMessage(v.toString())}
				/>
			</div>
			<div className="flex flex-row justify-end text-sm">
				<button
					className="cursor-pointer text-pink-800 hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline"
					disabled={isDefault}
					type="button"
					onClick={onReset}
				>
					<FontAwesomeIcon className="mr-1" icon={faRotateLeft} />
					Reset to default
				</button>
			</div>
		</div>
	)
}

export function PopularDogsPicker({ dogs, setDogs }: { dogs: QueueDogRow[]; setDogs: (update: (prev: QueueDogRow[]) => QueueDogRow[]) => void }) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>()
	// Remounts the picker after each pick so it clears
	const [pickerKey, setPickerKey] = useState(0)

	useEffect(() => {
		new DogsAPI().GetDogSelectFieldOptions().then((resp) => setOptions(resp?.options.map((d) => ({ label: d.name, value: String(d.ID) })) ?? []))
	}, [])

	const unlistedOptions = useMemo(() => options?.filter((o) => !dogs.some((d) => String(d.dogID) === o.value)), [dogs, options])
	const dogOptions = useMemo(
		() => dogs.map((d) => ({ label: d.watchers == null ? d.name : `${d.name} (${d.watchers} watching)`, value: d.dogID })),
		[dogs]
	)
	const includedIDs = useMemo(() => dogs.filter((d) => d.included).map((d) => d.dogID), [dogs])

	return (
		<div className="flex flex-col gap-y-3 text-left">
			<div className="flex flex-col gap-y-1">
				<CheckboxGroupInput
					columnOverride="columns-1 xl:columns-2"
					emptyText="No available dogs on these adopters' watchlists."
					fieldLabel="Popular Dogs"
					options={dogOptions}
					value={includedIDs}
					onChange={(ids) => setDogs((prev) => prev.map((r) => ({ ...r, included: ids.includes(r.dogID) })))}
				/>
			</div>
			<SelectInput
				fieldLabel="Add a Dog by Name"
				key={pickerKey}
				options={unlistedOptions}
				placeholder={options ? "— CHOOSE DOG —" : "Loading dogs..."}
				value={null}
				onChange={async (value) => {
					const option = options?.find((o) => o.value === value)
					if (option) {
						setDogs((prev) => addDogRow(prev, { dogID: Number(option.value), name: option.label }))
						setPickerKey((k) => k + 1)
					}
				}}
			/>
		</div>
	)
}
