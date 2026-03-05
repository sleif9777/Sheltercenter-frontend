/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	faDollarSign,
	faEnvelopeCircleCheck,
	faExclamationCircle,
	IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useMemo, useState } from "react"
import ReactQuill from "react-quill"

import { StringInputProps } from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { RichTextInput } from "../../core/components/formInputs/RichTextInput"
import { ValueLabelPair } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { ModalState } from "../../core/components/modal/Modal"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { SendMessageRequest } from "../../api/adopters/Requests"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { MessageAdopterFormFieldUpdater, useMessageFormState } from "./MessageFormState"
import { BookingMessageTemplate } from "../../enums/BookingEnums"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"

export type QuickText = ValueLabelPair<number> & {
	templateContent: ReactQuill.Value
}

export type WildcardDefaults = Partial<Record<BookingMessageTemplate, Record<string, string>>>

export function MessageForm({
	adopterID,
	apptID,
	hideSubject,
	initialValue,
	initialWildcardValues,
	isMessageToAdoptions,
	modalState,
	quickTextOptions,
	templateFlag,
}: {
	adopterID: number
	apptID?: number
	hideSubject?: boolean
	initialValue?: ReactQuill.Value
	initialWildcardValues?: Record<string, string>
	isMessageToAdoptions?: boolean
	modalState: ModalState
	quickTextOptions?: QuickText[]
	templateFlag?: BookingMessageTemplate
}) {
	// --- form state ---
	const formState = useMessageFormState(),
		schedule = useScheduleState()
	const { setField, errors, ...fields } = formState

	// --- wildcard state ---
	const [wildcardValues, setWildcardValues] = useState<Record<string, string>>({})
	const [isManuallyEdited, setIsManuallyEdited] = useState(false)
	const [selectedTemplate, setSelectedTemplate] = useState<ReactQuill.Value | undefined>(undefined)

	// Update message field in real-time when wildcards change
	useEffect(() => {
		if (selectedTemplate && !isManuallyEdited) {
			const replacedMessage = replaceWildcardsInDelta(selectedTemplate, wildcardValues)
			setField("message", replacedMessage)
		}
	}, [wildcardValues, selectedTemplate, isManuallyEdited, setField])

	useEffect(() => {
		if (templateFlag) {
			setField("templateFlag", templateFlag)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<SendMessageRequest> = useCallback(
		async (req: SendMessageRequest) => {
			// Message is already replaced in real-time via useEffect above
			const messageToSend = req.message

			const updatedReq = { ...req, message: messageToSend }

			const resp = isMessageToAdoptions
				? await new AdoptersAPI().MessageAdoptions(updatedReq)
				: await new AdoptersAPI().MessageAdopter(updatedReq)

			if (resp.status == 204) {
				showToast({ level: MessageLevel.Success, message: "Message sent!" })
				if (apptID && fields["templateFlag"] != undefined) {
					await new AppointmentsAPI().MarkTemplateSent(apptID, fields["templateFlag"])
					schedule.refresh()
				}
			} else {
				showToast({ level: MessageLevel.Error, message: "Failed to send!" })
			}
		},
		[apptID, fields, isMessageToAdoptions, schedule]
	)

	useEffect(() => {
		setField("adopterID", adopterID)

		if (initialValue) {
			setField("message", initialValue)
			setSelectedTemplate(initialValue)
		}
	}, [adopterID, initialValue, setField])

	return (
		<FormProvider
			formState={formState}
			hideCancel
			modalState={modalState}
			submitButtonProps={{
				icon: faEnvelopeCircleCheck,
				label: "Send",
			}}
			onSubmit={handleSubmit}
		>
			<Fieldset
				errors={errors}
				formData={fields}
				hideSubject={hideSubject}
				initialWildcardValues={initialWildcardValues}
				isManuallyEdited={isManuallyEdited}
				isMessageToAdoptions={isMessageToAdoptions ?? false}
				quickTextOptions={quickTextOptions}
				selectedTemplate={selectedTemplate}
				setField={setField}
				onManualEdit={() => setIsManuallyEdited(true)}
				onTemplateChange={(template) => {
					setSelectedTemplate(template)
					setIsManuallyEdited(false)
					setWildcardValues({})
				}}
				onWildcardsChange={setWildcardValues}
			/>
		</FormProvider>
	)
}

function Fieldset({
	formData,
	isMessageToAdoptions,
	hideSubject,
	quickTextOptions,
	setField,
	errors,
	selectedTemplate,
	isManuallyEdited,
	initialWildcardValues,
	onTemplateChange,
	onWildcardsChange,
	onManualEdit,
}: {
	formData: SendMessageRequest
	hideSubject?: boolean
	isMessageToAdoptions: boolean
	quickTextOptions?: QuickText[]
	setField: MessageAdopterFormFieldUpdater
	errors: ErrorMap<SendMessageRequest>
	selectedTemplate: ReactQuill.Value | undefined
	isManuallyEdited: boolean
	initialWildcardValues?: Record<string, string>
	onTemplateChange: (template: ReactQuill.Value) => void
	onWildcardsChange: (wildcards: Record<string, string>) => void
	onManualEdit: () => void
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof SendMessageRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: SendMessageRequest[K]) => setField(field, v),
		value: formData[field],
	})

	const hasWildcards = extractWildcardsFromDelta(selectedTemplate).length > 0

	return (
		<div className="flex flex-col gap-y-3">
			{quickTextOptions && (
				<QuickTextField
					options={quickTextOptions}
					setField={setField}
					value={formData["templateFlag"]}
					onTemplateChange={onTemplateChange}
				/>
			)}

			<div className="flex flex-col gap-3 md:flex-row">
				{/* Left column: Wildcard fields (50% width on md+) */}
				{hasWildcards && (
					<div className="flex w-full flex-col gap-y-3 text-left md:w-1/2">
						{/* Warning banner when manually edited */}
						<EditModeHelp
							color={isManuallyEdited ? "orange" : "green"}
							header={isManuallyEdited ? "Manual Edit Mode" : "Wildcard Edit Mode"}
							helpText={
								isManuallyEdited
									? "You've manually edited the message. Fill-in-the-blank fields are now disabled. Select a new template to reset."
									: "Fill-in-the-blank fields are enabled until you manually edit the message."
							}
							icon={isManuallyEdited ? faExclamationCircle : faDollarSign}
						/>

						<WildcardFields
							disabled={isManuallyEdited}
							initialValues={initialWildcardValues ?? {}}
							key={JSON.stringify(selectedTemplate)}
							templateContent={selectedTemplate}
							onWildcardsChange={onWildcardsChange}
						/>
					</div>
				)}

				{/* Right column: Subject and Message (50% width on md+ when wildcards present, full width otherwise) */}
				<div className={`flex w-full flex-col gap-y-3 ${hasWildcards ? "md:w-1/2" : ""}`}>
					{!hideSubject && <SubjectField {...bindField("subject")} />}
					<RichTextInput
						{...bindField("message")}
						addlProps={{
							onFocus: () => {
								// Mark as manually edited when user focuses the rich text editor
								if (!isManuallyEdited) {
									onManualEdit()
								}
							},
						}}
						bgColor={quickTextOptions ? "#fafafa" : "white"}
						fieldLabel="Message"
						showRequired
					/>
				</div>
			</div>

			{isMessageToAdoptions && (
				<div className="rounded border-2 border-orange-800 bg-orange-200 text-[12px] font-semibold text-orange-800 italic">
					Friendly reminder! Our operating hours are 12pm-6pm (M/Tu/W/F), 1pm-6pm (Th), and 12pm-3pm (Sa). Please allow up to
					24 hours for a response.
				</div>
			)}
		</div>
	)
}

function QuickTextField({
	value,
	setField,
	options,
	onTemplateChange,
}: {
	setField: MessageAdopterFormFieldUpdater
	options: QuickText[]
	value?: number
	onTemplateChange: (template: ReactQuill.Value) => void
}) {
	return (
		<RadioInput
			columnOverride="columns-2 md:columns-3 lg:columns-4 xl:columns-5"
			fieldLabel="Template"
			options={options}
			value={value}
			onChange={(v?: number) => {
				setField("templateFlag", v)
				const template = options.find((o) => o.value == v)?.templateContent ?? ""
				setField("message", template)
				onTemplateChange(template)
			}}
		/>
	)
}

function SubjectField({ errors, value, onChange }: StringInputProps) {
	return <TextInput errors={errors} fieldLabel="Subject" showRequired value={value} onChange={(e) => onChange(e)} />
}

interface WildcardFieldsProps {
	/** The current template content (Quill delta format) */
	templateContent: ReactQuill.Value | undefined
	/** Callback when any wildcard value changes */
	onWildcardsChange: (wildcards: Record<string, string>) => void
	/** Whether fields should be disabled (when manually edited) */
	disabled?: boolean
	initialValues?: Record<string, string>
}

/**
 * Extracts wildcards in the format $$$LABEL$$$ from a Quill delta
 */
function extractWildcardsFromDelta(content: ReactQuill.Value | undefined): string[] {
	if (!content) {
		return []
	}

	const found = new Set<string>()
	const ops = (content as any)?.ops

	if (!ops || !Array.isArray(ops)) {
		return []
	}

	ops.forEach((op: any) => {
		if (typeof op.insert === "string") {
			const matches = op.insert.match(/\$\$\$[^$]+\$\$\$/g)
			if (matches) {
				matches.forEach((match: string) => found.add(match))
			}
		}
	})

	return Array.from(found)
}

function EditModeHelp({
	icon,
	header,
	helpText,
	color,
}: {
	icon: IconDefinition
	header: string
	helpText: string
	color: "green" | "orange"
}) {
	const { bgColor, borderColor, headerTextColor, textColor } = {
		["green"]: {
			bgColor: "bg-green-50",
			borderColor: "border-green-500",
			headerTextColor: "text-green-900",
			textColor: "text-green-800",
		},
		["orange"]: {
			bgColor: "bg-orange-50",
			borderColor: "border-orange-300",
			headerTextColor: "text-orange-900",
			textColor: "text-orange-800",
		},
	}[color]

	return (
		<div className={"rounded-md border-2 p-3 " + `${borderColor} ${bgColor}`}>
			<div className="flex items-start gap-2">
				<span className={"text-xl " + textColor}>
					<FontAwesomeIcon icon={icon} />
				</span>
				<div className="flex-1">
					<p className={"text-sm font-semibold " + headerTextColor}>{header}</p>
					<p className={"text-xs " + textColor}>{helpText}</p>
				</div>
			</div>
		</div>
	)
}

/**
 * Component that detects wildcards in message templates and renders input fields for them
 */
function WildcardFields({
	templateContent,
	onWildcardsChange,
	disabled = false,
	initialValues = {},
}: WildcardFieldsProps) {
	const [wildcardValues, setWildcardValues] = useState<Record<string, string>>(initialValues)

	// Extract wildcards from the template
	const wildcards = useMemo(() => extractWildcardsFromDelta(templateContent), [templateContent])

	// Reset wildcard values when template changes
	useEffect(() => {
		setWildcardValues(initialValues)
		onWildcardsChange(initialValues)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateContent])

	// Notify parent when values change
	useEffect(() => {
		onWildcardsChange(wildcardValues)
	}, [wildcardValues, onWildcardsChange])

	const handleWildcardChange = (wildcard: string, value: string) => {
		setWildcardValues((prev) => ({
			...prev,
			[wildcard]: value,
		}))
	}

	if (wildcards.length === 0) {
		return null
	}

	return (
		<div
			className={"rounded-sm border-2 p-4 " + (disabled ? "rounded-sm border-gray-500 bg-gray-200" : "border-pink-600")}
		>
			<div className="mb-3 text-lg uppercase underline">Fill in the Blanks</div>
			<div className="space-y-3">
				{wildcards.map((wildcard) => {
					const label = wildcard.replace(/\$\$\$/g, "")
					return (
						<TextInput
							addlProps={{ disabled: disabled }}
							errors={[]}
							fieldLabel={label}
							key={wildcard}
							value={wildcardValues[wildcard] || ""}
							onChange={(value) => handleWildcardChange(wildcard, value)}
						/>
					)
				})}
			</div>
		</div>
	)
}

/**
 * Replaces wildcards in a Quill delta with provided values
 */
export function replaceWildcardsInDelta(
	content: ReactQuill.Value | undefined,
	wildcardValues: Record<string, string>
): ReactQuill.Value {
	if (!content) {
		return ""
	}

	const ops = (content as any)?.ops
	if (!ops || !Array.isArray(ops)) {
		return ""
	}

	const newOps = ops.map((op: any) => {
		if (typeof op.insert === "string") {
			let newInsert = op.insert

			// Replace each wildcard with its value
			Object.entries(wildcardValues).forEach(([wildcard, value]) => {
				if (value) {
					// Only replace if value is non-empty
					newInsert = newInsert.replace(new RegExp(wildcard.replace(/\$/g, "\\$"), "g"), value)
				}
			})

			return {
				...op,
				insert: newInsert,
			}
		}
		return op
	})

	return { ops: newOps } as ReactQuill.Value
}

/**
 * Converts a Quill delta to plain text (for textarea display)
 */
export function deltaToPlainText(content: ReactQuill.Value | undefined): string {
	if (!content) return ""

	const ops = (content as any)?.ops
	if (!ops || !Array.isArray(ops)) return ""

	return ops
		.map((op: any) => {
			if (typeof op.insert === "string") {
				return op.insert
			}
			return ""
		})
		.join("")
}

/**
 * Converts plain text back to a simple Quill delta
 */
export function plainTextToDelta(text: string): ReactQuill.Value {
	return {
		ops: [{ insert: text }],
	} as ReactQuill.Value
}
