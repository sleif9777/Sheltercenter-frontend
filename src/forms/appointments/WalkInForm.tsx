import { faArrowRotateBack, faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"

import { EmailInput } from "../../core/components/formInputs/EmailInput"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { ModalState } from "../../core/components/modal/Modal"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CreateWalkInRequest } from "../../api/appointments/Requests"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { AppointmentTypeField } from "./AppointmentForm"
import { useWalkInFormState, WalkInFormFieldUpdater, WalkInFormFullUpdater } from "./WalkInFormState"

export function WalkInForm({ modalState }: { modalState: ModalState }) {
	// --- form state ---
	const formState = useWalkInFormState()
	const schedule = useScheduleState()
	const { setField, setAll, errors } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CreateWalkInRequest> = useCallback(
		async (req) => {
			await new AppointmentsAPI().CreateWalkIn(req)
			schedule.refresh()
		},
		[schedule]
	)

	if (!formState) {
		return <div>Loading...</div>
	}

	return (
		<>
			<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
				<Fieldset errors={errors} formData={formState} setAll={setAll} setField={setField} />
			</FormProvider>
		</>
	)
}

function Fieldset({
	errors,
	formData,
	setAll,
	setField,
}: {
	errors: ErrorMap<CreateWalkInRequest>
	formData: CreateWalkInRequest
	setAll: WalkInFormFullUpdater
	setField: WalkInFormFieldUpdater
}) {
	const bindField = <K extends keyof CreateWalkInRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CreateWalkInRequest[K]) => setField(field, v),
		value: formData[field],
	})

	// --- walk-in specific state ---
	const [isCreatingNew, setIsCreatingNew] = useState(false)
	const [selectedAdopterId, setSelectedAdopterId] = useState<number | null>(null)

	const handleAdopterChange = useCallback(
		async (value: string | null) => {
			const ID = value ? Number(value) : 0
			setSelectedAdopterId(ID)
			setField("adopterID", ID)
			setIsCreatingNew(false)
		},
		[setField]
	)

	const handleCreateNew = useCallback(() => {
		setIsCreatingNew(true)
		setSelectedAdopterId(null)
		// Clear preferences for new adopter
		setAll({
			adopterID: "*",
			firstName: "",
			lastName: "",
			primaryEmail: "",
		})
	}, [setAll])

	return (
		<div className="flex flex-col gap-y-3">
			<WalkInInstructions />
			<AppointmentTypeField {...bindField("type")} isTemplate />

			{/* Step 1: Search for existing adopter */}
			{!isCreatingNew && (
				<AdopterSearchField
					errors={errors["adopterID"]}
					value={selectedAdopterId}
					onChange={handleAdopterChange}
					onCreateNew={handleCreateNew}
				/>
			)}

			{/* Step 2: If creating new, show new adopter fields */}
			{isCreatingNew && (
				<div className="flex items-end gap-2">
					<NewAdopterFields errors={errors} formData={formData} setField={setField} />
					<button
						className="mb-1 flex cursor-pointer items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white uppercase transition-colors hover:bg-gray-700"
						type="button"
						onClick={() => {
							setIsCreatingNew(false)
							setAll({
								adopterID: 0,
								firstName: "",
								lastName: "",
								primaryEmail: "",
							})
						}}
					>
						<FontAwesomeIcon icon={faArrowRotateBack} />
						Back to Search
					</button>
				</div>
			)}
		</div>
	)
}

function WalkInInstructions() {
	return (
		<Message
			level={MessageLevel.Default}
			message="Search for an existing adopter by name or email. If they're not in the system, create a new profile."
		/>
	)
}

function AdopterSearchField({
	errors,
	value,
	onChange,
	onCreateNew,
}: {
	errors?: string[]
	value: number | null
	onChange: (value: string | null) => Promise<void>
	onCreateNew: () => void
}) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const loadOptions = useCallback(async () => {
		setIsLoading(true)
		try {
			const resp = await new AdoptersAPI().GetAdopterSelectFieldOptions(false, true) // includeWalkIns = true
			const loadedOptions: SelectInputOption<string>[] = resp.options.map((adopter) => ({
				label: adopter.disambiguatedName,
				value: String(adopter.ID),
			}))
			setOptions(loadedOptions)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-end gap-2">
				<div className="flex-1 rounded-md border-2 border-pink-200 bg-pink-50 p-4">
					<SelectInput
						addlProps={{
							style: { backgroundColor: "white" },
						}}
						errors={errors}
						fieldLabel="Search Existing Adopter"
						options={options}
						placeholder={isLoading ? "Loading..." : "Search by name or email..."}
						showRequired={!value}
						value={String(value ?? "")}
						onChange={onChange}
					/>
				</div>
				<button
					className="mb-1 flex cursor-pointer items-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white uppercase transition-colors hover:bg-pink-700"
					type="button"
					onClick={onCreateNew}
				>
					<FontAwesomeIcon icon={faUserPlus} />
					Create New
				</button>
			</div>
		</div>
	)
}

function NewAdopterFields({
	formData,
	errors,
	setField,
}: {
	errors: ErrorMap<CreateWalkInRequest>
	formData: CreateWalkInRequest
	setField: WalkInFormFieldUpdater
}) {
	const bindField = <K extends keyof CreateWalkInRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CreateWalkInRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<div className="flex-1 rounded-md border-2 border-pink-200 bg-pink-50 p-4">
			<div className="mb-3 flex items-center gap-2 text-pink-900">
				<h3 className="text-[16px] uppercase">New Walk-In Adopter</h3>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<TextInput
					addlProps={{ style: { backgroundColor: "white" } }}
					{...bindField("firstName")}
					fieldLabel="First Name"
					showRequired
				/>
				<TextInput
					addlProps={{ style: { backgroundColor: "white" } }}
					{...bindField("lastName")}
					fieldLabel="Last Name"
					showRequired
				/>
			</div>

			<div className="mt-3">
				<EmailInput
					addlProps={{ style: { backgroundColor: "white" } }}
					{...bindField("primaryEmail")}
					fieldLabel="Email Address"
					showRequired
				/>
			</div>
		</div>
	)
}
