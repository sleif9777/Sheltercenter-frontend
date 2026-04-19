import { useCallback, useEffect, useState } from "react"

import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { ScheduleAppointmentWithPreferencesRequest } from "../../api/appointments/Requests"
import SelectInput, { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { SessionState } from "../../core/session/SessionState"
import { IAppointment } from "../../models/AppointmentModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AdopterPreferenceFieldset, AllFieldsOptionalMessage } from "../adopter/AdopterPreferenceForm"
import { AdopterPreferencesFormFieldUpdater } from "../adopter/AdopterPreferenceFormState"
import { FormProvider } from "../FormProvider"
import { useBookingFormState } from "./BookingFormState"

// ----------------------
// Form window
// ----------------------
export function BookingForm({
	apptData,
	modalState,
	session,
}: {
	apptData: IAppointment
	modalState: ModalState
	session: SessionState
}) {
	// --- form state ---
	const formState = useBookingFormState()
	const schedule = useScheduleState()
	const { setField, setAll, errors, ...fields } = formState

	// --- load adopter preferences ---
	const loadAdopterPreferences = useCallback(
		async (id: number) => {
			const resp = await new AdoptersAPI().GetAdopterPreferences(id)
			setAll(resp.pref)
		},
		[setAll]
	)

	const handleAdopterChange = useCallback(
		async (value: string | null) => {
			const ID = value ? Number(value) : 0
			setField("adopterID", ID)

			if (ID) {
				await loadAdopterPreferences(ID)
			}
		},
		[loadAdopterPreferences, setField]
	)

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<ScheduleAppointmentWithPreferencesRequest> = useCallback(
		async (req) => {
			await new AppointmentsAPI().ScheduleAppointment(req)
			schedule.refresh()
		},
		[schedule]
	)

	useEffect(() => {
		setField("apptID", apptData.ID)
		if (apptData.booking?.adopter?.demographics.ID) {
			handleAdopterChange(apptData.booking.adopter.demographics.ID.toString())
		}
	}, [apptData.ID, apptData.booking, handleAdopterChange, setField])

	if (!formState) {
		return <div>Loading...</div>
	}

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<AllFieldsOptionalMessage session={session} />
			<AdopterSelectField
				apptData={apptData}
				errors={errors["adopterID"]}
				session={session}
				value={formState.adopterID}
				onChange={handleAdopterChange}
			/>
			<AdopterPreferenceFieldset
				apptType={apptData.type}
				errors={errors}
				formData={fields}
				session={session}
				setField={setField as AdopterPreferencesFormFieldUpdater}
			/>
		</FormProvider>
	)
}

export function AdopterSelectField({
	apptData,
	errors,
	session,
	value,
	onChange,
}: {
	apptData: IAppointment
	errors?: string[]
	session: SessionState
	value: number
	onChange: (value: string | null) => Promise<void> // Updated signature
}) {
	const [options, setOptions] = useState<SelectInputOption<string>[]>([])
	const [loadingOptions, setLoadingOptions] = useState(false)

	const loadOptions = useCallback(async () => {
		setLoadingOptions(true)
		const resp = await new AdoptersAPI().GetAdopterSelectFieldOptions(false, true)
		const loadedOptions: SelectInputOption<string>[] = resp.options.map((adopter) => ({
			label: adopter.disambiguatedName,
			value: String(adopter.ID),
		}))
		setOptions(loadedOptions)
		setLoadingOptions(false)
	}, [])

	useEffect(() => {
		loadOptions()
	}, [loadOptions])

	return (
		<SelectInput
			disabled={options.length == 0 || apptData.hasCurrentBooking || session.adopterUser}
			errors={errors}
			fieldLabel="Adopter"
			hidden={apptData.hasCurrentBooking || session.adopterUser}
			options={options}
			placeholder={loadingOptions ? "Loading options..." : "—CHOOSE ADOPTER—"}
			showRequired
			value={String(value ?? "")}
			onChange={onChange}
		/>
	)
}
