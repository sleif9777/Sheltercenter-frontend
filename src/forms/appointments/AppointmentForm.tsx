import { useCallback, useEffect, useState } from "react"

import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import {
	BooleanInputProps,
	OptionalValueInputProps,
	RequiredEnumInputProps,
} from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { TimeChangeHandler, TimeInput } from "../../core/components/formInputs/TimeInput"
import { ModalState } from "../../core/components/modal/Modal"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CreateAppointmentRequest } from "../../api/appointments/Requests"
import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { AppointmentFormFieldUpdater, useAppointmentFormState } from "./AppointmentFormState"

export function AppointmentForm({ modalState }: { modalState?: ModalState }) {
	// --- form state ---
	const formState = useAppointmentFormState()
	const schedule = useScheduleState()

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CreateAppointmentRequest> = useCallback(
		async (req: CreateAppointmentRequest) => {
			await new AppointmentsAPI().CreateAppointment(req)
			schedule.refresh()
		},
		[schedule]
	)

	const { setField, errors, ...fields } = formState

	useEffect(() => {
		setField("isoDate", schedule.isoDate)
	}, [schedule.isoDate, setField])

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={errors} formState={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	formState,
	setField,
	errors,
}: {
	formState: CreateAppointmentRequest
	setField: AppointmentFormFieldUpdater
	errors: ErrorMap<CreateAppointmentRequest>
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CreateAppointmentRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CreateAppointmentRequest[K]) => setField(field, v),
		value: formState[field],
	})

	const timeFieldErrors = [...(errors["minute"] ?? []), ...(errors["hour"] ?? [])]

	return (
		<div className="flex flex-col gap-y-2">
			<AppointmentTimeField
				errors={timeFieldErrors}
				hour={formState["hour"]}
				minute={formState["minute"]}
				setField={setField}
			/>
			<AppointmentTypeField {...bindField("type")} />
			{isAdoptionAppointment(formState["type"]) && <LockedField {...bindField("locked")} />}
			{isPaperworkAppointment(formState["type"]) && (
				<PendingAdoptionSelectField
					errors={errors["pendingAdoptionID"]}
					setField={setField}
					value={formState["pendingAdoptionID"]}
				/>
			)}
			{isAdminAppointment(formState["type"]) && (
				<div className="grid grid-cols-2 grid-rows-1 gap-x-5">
					<NotesField type={formState["type"]} {...bindField("notes")} />
					{isSurrenderAppointment(formState["type"]) && <FKAField {...bindField("fka")} />}
				</div>
			)}
		</div>
	)
}

function AppointmentTimeField({
	hour,
	minute,
	setField,
	errors,
}: {
	hour: number
	minute: number
	setField: AppointmentFormFieldUpdater
	errors: string[]
}) {
	const handleTimeChange: TimeChangeHandler = useCallback(
		(m) => {
			setField("hour", m?.get("hour") ?? 0)
			setField("minute", m?.get("minute") ?? 0)
		},
		[setField]
	)

	return (
		<TimeInput
			defaultDirty
			errors={errors}
			fieldLabel="Time"
			hour={hour}
			minute={minute}
			showRequired
			onChange={handleTimeChange}
		/>
	)
}

export function AppointmentTypeField({
	isTemplate,
	onChange,
	value,
}: { isTemplate?: boolean } & RequiredEnumInputProps<AppointmentType>) {
	let options = [
		{ label: "Adults", value: AppointmentType.ADULTS },
		{ label: "Puppies", value: AppointmentType.PUPPIES },
		{ label: "All Ages", value: AppointmentType.ALL_AGES },
		{ label: "Fun-Size", value: AppointmentType.FUN_SIZE },
	]

	if (!isTemplate) {
		options = [
			...options,
			{ label: "Paperwork", value: AppointmentType.PAPERWORK },
			{ label: "Surrender", value: AppointmentType.SURRENDER },
			{ label: "Visit", value: AppointmentType.VISIT },
			{ label: "Donation Drop-Off", value: AppointmentType.DONATION_DROP_OFF },
		]
	}

	return (
		<RadioInput
			fieldLabel="Type"
			options={options}
			value={value}
			onChange={(newType: AppointmentType) => onChange(newType)}
		/>
	)
}

function PendingAdoptionSelectField({
	errors,
	value,
	setField,
}: {
	errors?: string[]
	value: number
	setField: AppointmentFormFieldUpdater
}) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>([])

	const handleAdoptionChange = useCallback(
		async (value: string | null) => {
			const ID = value ? Number(value) : 0
			setField("pendingAdoptionID", ID)
		},
		[setField]
	)

	const loadOptions = useCallback(async () => {
		const resp = await new PendingAdoptionsAPI().GetPendingAdoptionSelectFieldOptions()
		const loadedOptions: SelectInputOption<string>[] = resp.adoptions.map((adoption) => ({
			label: adoption.description,
			value: adoption.ID.toString(),
		}))
		setOptions(loadedOptions)
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	return (
		<SelectInput
			errors={errors}
			fieldLabel="Adoption"
			options={options}
			placeholder="—CHOOSE ADOPTION—"
			showRequired
			value={String(value ?? "")}
			onChange={handleAdoptionChange}
		/>
	)
}

function LockedField({ value, onChange }: BooleanInputProps) {
	return <CheckboxInput fieldLabel="Lock Appointment?" value={value} onChange={onChange} />
}

function NotesField({
	errors,
	value,
	onChange,
	type,
}: OptionalValueInputProps<string> & {
	type: AppointmentType
}) {
	const label = typeRequiresDogName(type) ? "Dog" : "Notes"

	return (
		<TextInput
			errors={errors}
			fieldLabel={label}
			showRequired={!isDonationAppointment(type)}
			value={value ?? ""}
			onChange={(v) => onChange(v)}
		/>
	)
}

function FKAField({ errors, value, onChange }: OptionalValueInputProps<string>) {
	return <TextInput errors={errors} fieldLabel="FKA" value={value ?? ""} onChange={(v) => onChange(v)} />
}

// TODO: move these to a util
export function isAdoptionAppointment(type: AppointmentType) {
	return (
		type == AppointmentType.ADULTS ||
		type == AppointmentType.PUPPIES ||
		type == AppointmentType.ALL_AGES ||
		type == AppointmentType.FUN_SIZE
	)
}

function isAdminAppointment(type: AppointmentType) {
	return !isAdoptionAppointment(type) && !isPaperworkAppointment(type)
}

function isPaperworkAppointment(type: AppointmentType) {
	return type == AppointmentType.PAPERWORK
}

function isSurrenderAppointment(type: AppointmentType) {
	return type == AppointmentType.SURRENDER
}

function isVisitAppointment(type: AppointmentType) {
	return type == AppointmentType.VISIT
}

function isDonationAppointment(type: AppointmentType) {
	return type == AppointmentType.DONATION_DROP_OFF
}

function typeRequiresDogName(type: AppointmentType) {
	return isPaperworkAppointment(type) || isSurrenderAppointment(type) || isVisitAppointment(type)
}
