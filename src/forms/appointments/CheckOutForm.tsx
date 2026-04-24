import { useCallback, useEffect, useState } from "react"

import { Toggleable } from "../../core/components/formInputs/CheckboxInput"
import { BooleanInputProps, RequiredEnumInputProps } from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { Outcome } from "../../enums/AppointmentEnums"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CheckOutAppointmentRequest } from "../../api/appointments/Requests"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { CheckOutFormFieldUpdater, useCheckOutFormState } from "./CheckOutFormState"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { DogsAPI } from "../../api/dogs/DogsAPI"

export function CheckOutForm({
	apptID,
	defaults,
	modalState,
}: {
	apptID: number
	defaults?: Partial<CheckOutAppointmentRequest>
	modalState: ModalState
}) {
	// --- form state ---
	const formState = useCheckOutFormState(),
		schedule = useScheduleState()
	const { setAll, setField, errors, ...fields } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CheckOutAppointmentRequest> = useCallback(
		async (req: CheckOutAppointmentRequest) => {
			await new AppointmentsAPI().CheckOutAppointment(req)
			schedule.refresh()
		},
		[schedule]
	)

	// --- initialize if booking exists ---
	useEffect(() => {
		setField("apptID", apptID)

		if (defaults) {
			setAll(defaults)
		}
	}, [apptID, defaults, setAll, setField])

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={errors} formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<CheckOutAppointmentRequest>
	formData: CheckOutAppointmentRequest
	setField: CheckOutFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CheckOutAppointmentRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CheckOutAppointmentRequest[K]) => setField(field, v),
		value: formData[field],
	})

	const handleOutcomeChange = useCallback(
		(v: Outcome) => {
			setField("outcome", v)

			if (!isDogChoiceOutcome(v)) {
				setField("dogID", "")
			}
		},
		[setField]
	)

	const handleDogChange = useCallback(
		async (value: string | null) => {
			setField("dogID", value ?? undefined)
		},
		[setField]
	)

	return (
		<div className="flex flex-col gap-y-3">
			<OutcomeField value={formData["outcome"]} onChange={handleOutcomeChange} />
			{/* {isDogChoiceOutcome(formData["outcome"]) && <ChosenDogField {...bindField("dog")} />} */}
			{isDogChoiceOutcome(formData["outcome"]) && (
				<DogSelectField errors={errors["dogID"]} value={formData["dogID"]} onChange={handleDogChange} />
			)}
			{formData["outcome"] == Outcome.NO_DECISION && <SendSleepoverInfoField {...bindField("sendSleepoverInfo")} />}
		</div>
	)
}

function OutcomeField({ value, onChange }: RequiredEnumInputProps<Outcome>) {
	const options = [
		{ label: "Adoption", value: Outcome.ADOPTION },
		{ label: "Chosen", value: Outcome.CHOSEN },
		{ label: "FTA", value: Outcome.FTA },
		{ label: "No Decision", value: Outcome.NO_DECISION },
		{ label: "No Show", value: Outcome.NO_SHOW },
	]

	return (
		<RadioInput fieldLabel="Gender Preference" options={options} value={value} onChange={(v: Outcome) => onChange(v)} />
	)
}

export function DogSelectField({
	errors,
	value,
	onChange,
}: {
	errors?: string[]
	value: string | undefined
	onChange: (value: string | null) => Promise<void>
}) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>([])
	const [loadingOptions, setLoadingOptions] = useState(false)

	const loadOptions = useCallback(async () => {
		setLoadingOptions(true)
		const resp = await new DogsAPI().GetDogSelectFieldOptions()
		const loadedOptions: SelectInputOption<string>[] = resp.options.map((dog) => ({
			label: dog.name,
			value: String(dog.ID),
		}))
		setOptions(loadedOptions)
		setLoadingOptions(false)
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	return (
		<SelectInput
			errors={errors}
			fieldLabel="Chosen Dog"
			options={options}
			placeholder={loadingOptions ? "Loading options..." : "— CHOOSE DOG —"}
			showRequired
			value={value ?? null}
			onChange={onChange}
		/>
	)
}

function SendSleepoverInfoField({ value, onChange }: BooleanInputProps) {
	return <Toggleable fieldLabel="Send Sleepover information?" value={value} onChange={onChange} />
}

function isDogChoiceOutcome(outcome: Outcome) {
	return [Outcome.ADOPTION, Outcome.FTA, Outcome.CHOSEN].includes(outcome)
}
