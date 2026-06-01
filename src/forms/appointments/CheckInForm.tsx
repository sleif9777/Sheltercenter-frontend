import { useCallback, useEffect } from "react"

import { OptionalValueInputProps } from "../../core/components/formInputs/InputHandlers"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { ModalState } from "../../core/components/modal/Modal"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CheckInAppointmentRequest } from "../../api/appointments/Requests"
import { FormProvider } from "../FormProvider"
import { CheckInFormFieldUpdater, useCheckInFormState } from "./CheckInFormState"
import { ErrorMap } from "../FormState"

export function CheckInForm({
	apptID,
	defaultValues,
	modalState,
	onSubmit,
}: {
	apptID: number
	defaultValues?: Partial<CheckInAppointmentRequest>
	modalState: ModalState
	onSubmit?: () => void
}) {
	// --- form state ---
	const formData = useCheckInFormState(),
		schedule = useScheduleState()
	const { errors, setField, ...fields } = formData

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CheckInAppointmentRequest> = useCallback(
		async (req: CheckInAppointmentRequest) => {
			await new AppointmentsAPI().CheckInAppointment(req)
			onSubmit?.()
			schedule.refresh()
		},
		[onSubmit, schedule]
	)

	// --- initialize if booking exists ---
	useEffect(() => {
		setField("apptID", apptID)

		if (defaultValues) {
			Object.entries(defaultValues).forEach(([field, value]) => {
				setField(field as keyof CheckInAppointmentRequest, value)
			})
		}
	}, [apptID, defaultValues, setField])

	return (
		<FormProvider formState={formData} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={errors} formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<CheckInAppointmentRequest>
	formData: CheckInAppointmentRequest
	setField: CheckInFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CheckInAppointmentRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CheckInAppointmentRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<div className="flex flex-col gap-y-1">
			<CounselorField {...bindField("counselor")} />
			<ClothingDescriptionField {...bindField("clothingDescription")} />
		</div>
	)
}

function CounselorField({ value, onChange }: OptionalValueInputProps<string>) {
	return <TextInput fieldLabel="Counselor" showRecommended value={value ?? ""} onChange={(e) => onChange(e)} />
}

function ClothingDescriptionField({ value, onChange }: OptionalValueInputProps<string>) {
	return <TextInput fieldLabel="Clothing Description" showRecommended value={value ?? ""} onChange={(e) => onChange(e)} />
}
