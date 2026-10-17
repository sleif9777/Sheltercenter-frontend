import { useCallback, useEffect, useState } from "react"

import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import { OptionalEnumInputProps } from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { NoDecisionEmailOption, Outcome, OutcomeLabel } from "../../enums/AppointmentEnums"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import {
	canHaveSecondDog,
	CheckOutFormFields,
	CheckOutFormFieldUpdater,
	isDogChoiceOutcome,
	sendsSecondDog,
	toCheckOutRequest,
	useCheckOutFormState,
} from "./CheckOutFormState"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { DogsAPI } from "../../api/dogs/DogsAPI"

export function CheckOutForm({ apptID, defaults, modalState }: { apptID: number; defaults?: Partial<CheckOutFormFields>; modalState: ModalState }) {
	// --- form state ---
	const formState = useCheckOutFormState(),
		schedule = useScheduleState()
	const { setAll, setField, errors, ...fields } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CheckOutFormFields> = useCallback(
		async (fields: CheckOutFormFields) => {
			await new AppointmentsAPI().CheckOutAppointment(toCheckOutRequest(fields))
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
	errors: ErrorMap<CheckOutFormFields>
	formData: CheckOutFormFields
	setField: CheckOutFormFieldUpdater
}) {
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
			{isDogChoiceOutcome(formData["outcome"]) && <DogSelectField errors={errors["dogID"]} value={formData["dogID"]} onChange={handleDogChange} />}
			{canHaveSecondDog(formData) && <SecondDogFields errors={errors} formData={formData} setField={setField} />}
			{formData.hasExistingSecondDog && !sendsSecondDog(formData) && (
				<p className="text-sm font-bold text-red-800">Saving will cancel the second dog's adoption.</p>
			)}
			{formData["outcome"] == Outcome.NO_DECISION && (
				<RadioInput
					fieldLabel="Send email?"
					options={[
						{ label: "Yes, with sleepover info", value: NoDecisionEmailOption.WITH_SLEEPOVER },
						{ label: "Yes", value: NoDecisionEmailOption.STANDARD },
						{ label: "No", value: NoDecisionEmailOption.NO_EMAIL },
					]}
					value={formData["noDecisionEmailOption"]}
					onChange={(v: NoDecisionEmailOption) => setField("noDecisionEmailOption", v)}
				/>
			)}
		</div>
	)
}

function SecondDogFields({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<CheckOutFormFields>
	formData: CheckOutFormFields
	setField: CheckOutFormFieldUpdater
}) {
	const handleDogChange = useCallback(
		async (value: string | null) => {
			setField("secondDogID", value ?? undefined)
		},
		[setField]
	)

	return (
		<>
			<CheckboxInput
				fieldLabel="Adopter chose a second dog"
				helpText="Records the second dog as its own adoption, linked to this appointment."
				value={formData.hasSecondDog}
				onChange={(checked) => setField("hasSecondDog", checked)}
			/>
			{formData.hasSecondDog && (
				<>
					<OutcomeField
						errors={errors["secondOutcome"]}
						fieldLabel="Second Dog Outcome"
						outcomes={SECOND_DOG_OUTCOMES}
						value={formData.secondOutcome ?? undefined}
						onChange={(v) => setField("secondOutcome", v)}
					/>
					<DogSelectField
						errors={errors["secondDogID"]}
						fieldLabel="Second Chosen Dog"
						value={formData.secondDogID ?? undefined}
						onChange={handleDogChange}
					/>
				</>
			)}
		</>
	)
}

const ALL_OUTCOMES = [Outcome.ADOPTION, Outcome.CHOSEN, Outcome.FTA, Outcome.NO_DECISION, Outcome.NO_SHOW]
const SECOND_DOG_OUTCOMES = [Outcome.ADOPTION, Outcome.CHOSEN, Outcome.FTA]

function OutcomeField({
	errors,
	fieldLabel = "Outcome",
	outcomes = ALL_OUTCOMES,
	value,
	onChange,
}: Omit<OptionalEnumInputProps<Outcome>, "onChange"> & {
	outcomes?: Outcome[]
	onChange: (value: Outcome) => void
}) {
	const options = outcomes.map((outcome) => ({ label: OutcomeLabel[outcome], value: outcome }))

	return (
		<RadioInput errors={errors} fieldLabel={fieldLabel} options={options} value={value} onChange={(v?: Outcome) => v !== undefined && onChange(v)} />
	)
}

export function DogSelectField({
	errors,
	fieldLabel = "Chosen Dog",
	value,
	onChange,
}: {
	errors?: string[]
	fieldLabel?: string
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
			fieldLabel={fieldLabel}
			options={options}
			placeholder={loadingOptions ? "Loading options..." : "— CHOOSE DOG —"}
			showRequired
			value={value ?? null}
			onChange={onChange}
		/>
	)
}
