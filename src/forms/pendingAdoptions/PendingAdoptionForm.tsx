import { useCallback, useEffect, useState } from "react"

import { RequiredEnumInputProps } from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { useChosenBoardState } from "../../pages/chosenBoard/ChosenBoardAppState"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { CreatePendingAdoptionRequest } from "../../api/pendingAdoptions/Requests"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { PendingAdoptionFormFieldUpdater, usePendingAdoptionFormState } from "./PendingAdoptionFormState"
import { CircumstanceOptions } from "../../enums/PendingAdoptionEnums"
import { DogSelectField } from "../appointments/CheckOutForm"

export function PendingAdoptionForm({ modalState }: { modalState: ModalState }) {
	// --- form state ---
	const formState = usePendingAdoptionFormState()
	const boardState = useChosenBoardState()

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CreatePendingAdoptionRequest> = useCallback(
		async (req: CreatePendingAdoptionRequest) => {
			await new PendingAdoptionsAPI().CreatePendingAdoption(req)
			boardState.refresh()
		},
		[boardState]
	)

	if (!formState) {
		return <div>Loading...</div>
	}

	const { setField, ...fields } = formState

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={formState.errors} formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<CreatePendingAdoptionRequest>
	formData: CreatePendingAdoptionRequest
	setField: PendingAdoptionFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CreatePendingAdoptionRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CreatePendingAdoptionRequest[K]) => setField(field, v),
		value: formData[field],
	})

	const handleAdopterChange = useCallback(
		async (value: string | null) => {
			const ID = value ? Number(value) : 0
			setField("adopterID", ID)
		},
		[setField]
	)

	const handleDogChange = useCallback(
		async (value: string | null) => {
			setField("dogID", parseInt(value ?? "0"))
		},
		[setField]
	)

	return (
		<div className="flex flex-col gap-y-1">
			<AdopterSelectField
				errors={errors["adopterID"]}
				value={formData.adopterID.toString()}
				onChange={handleAdopterChange}
			/>
			{/* <ChosenDogField {...bindField("dog")} /> */}
			<DogSelectField errors={errors["dogID"]} value={formData.dogID.toString()} onChange={handleDogChange} />
			<CircumstanceField {...bindField("circumstance")} />
		</div>
	)
}

function AdopterSelectField({
	errors,
	value,
	onChange,
}: {
	errors?: string[]
	value: string
	onChange: (value: string | null) => Promise<void>
}) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>([])

	const loadOptions = useCallback(async () => {
		const resp = await new AdoptersAPI().GetAdopterSelectFieldOptions(true, true)
		const loadedOptions: SelectInputOption<string>[] = resp.options.map((adopter) => ({
			label: adopter.disambiguatedName,
			value: adopter.ID.toString(),
		}))
		setOptions(loadedOptions.sort((a, b) => b.label.localeCompare(a.label)))
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	return (
		<SelectInput
			errors={errors}
			fieldLabel="Adopter"
			options={options}
			placeholder="Search adopters..."
			showRequired
			value={value}
			onChange={onChange}
		/>
	)
}

function CircumstanceField({ value, onChange }: RequiredEnumInputProps<CircumstanceOptions>) {
	const options = [
		{ label: "Host Weekend", value: 0 },
		{ label: "Foster", value: 1 },
		{ label: "Open House", value: 6 },
		{ label: "Friend of Foster", value: 3 },
		{ label: "Friend of Molly", value: 4 },
		{ label: "Other", value: 5 },
	]

	return (
		<RadioInput
			fieldLabel={"Adoption Context"}
			options={options}
			value={value}
			onChange={(newCircumstance: CircumstanceOptions) => onChange(newCircumstance)}
		/>
	)
}
