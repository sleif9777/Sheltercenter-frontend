import { Autocomplete, TextField } from "@mui/material"
import { useCallback, useEffect, useId, useState } from "react"

import { DogsAPI } from "../../api/dogs/DogsAPI"
import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import {
	BooleanInputProps,
	OptionalValueInputProps,
	RequiredEnumInputProps,
} from "../../core/components/formInputs/InputHandlers"
import { InputErrorLabel, InputLabel } from "../../core/components/formInputs/InputLabels"
import RadioInput from "../../core/components/formInputs/RadioInput"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { TimeChangeHandler, TimeInput } from "../../core/components/formInputs/TimeInput"
import { ModalState } from "../../core/components/modal/Modal"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { SurrenderDogOption } from "../../models/DogModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { DateTime } from "../../utils/DateTime"
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
			{isAdminAppointment(formState["type"]) && !isSurrenderAppointment(formState["type"]) && (
				<NotesField type={formState["type"]} {...bindField("notes")} />
			)}
			{isSurrenderAppointment(formState["type"]) && (
				<>
					<SurrenderDogSelectField
						errors={errors["surrenderDogID"]}
						setField={setField}
						value={formState["surrenderDogID"]}
					/>
					<NotesField type={formState["type"]} {...bindField("notes")} />
					<FKAField {...bindField("fka")} />
				</>
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

function SurrenderDogSelectField({
	errors,
	value,
	setField,
}: {
	errors?: string[]
	value?: number
	setField: AppointmentFormFieldUpdater
}) {
	const [options, setOptions] = useState<SurrenderDogOption[]>([])
	const [dirty, setDirty] = useState(false)
	const elemID = useId()

	const loadOptions = useCallback(async () => {
		const resp = await new DogsAPI().GetSurrenderDogOptions()
		setOptions(resp.options)
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	const selectedOption = options.find((o) => o.ID === value) ?? null

	return (
		<div className="flex flex-col gap-1">
			<InputLabel
				elemID={elemID}
				fieldLabel="Dog"
				showError={dirty && (errors ?? []).length > 0}
				showRequired={(value ?? 0) > 0 && !dirty}
			/>
			<Autocomplete<SurrenderDogOption, false, false, false>
				fullWidth
				getOptionLabel={(o) => o.name}
				id={elemID}
				isOptionEqualToValue={(o, v) => o.ID === v.ID}
				options={options}
				renderInput={(params) => (
					<TextField
						{...params}
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: "#d1d5db" },
								"&.Mui-focused": { boxShadow: "0 0 0 2px rgba(236,72,153,0.3)" },
								"&.Mui-focused fieldset": { borderColor: "#ec4899" },
								"&:hover fieldset": { borderColor: "#9ca3af" },
							},
						}}
					/>
				)}
				renderOption={(props, option) => (
					<li {...props} key={option.ID}>
						<div className="flex items-center gap-3 py-1">
							{option.photoURL && (
								<img alt={option.name} className="h-10 w-10 shrink-0 rounded object-cover" src={option.photoURL} />
							)}
							<div>
								<div className="font-medium">{option.name}</div>
								<div className="text-xs text-gray-500">
									SL-{option.shelterluvID} · Last updated:{" "}
									{option.lastUpdated ? new DateTime(option.lastUpdated).GetShortDate() : "unknown"}
								</div>
							</div>
						</div>
					</li>
				)}
				value={selectedOption}
				onBlur={() => setDirty(true)}
				onChange={(_, newValue) => {
					setField("surrenderDogID", newValue?.ID ?? 0)
				}}
			/>
			{errors && dirty && <InputErrorLabel errors={errors} />}
		</div>
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
			showRequired={!isDonationAppointment(type) && !isSurrenderAppointment(type)}
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
	return isPaperworkAppointment(type) || isVisitAppointment(type)
}
