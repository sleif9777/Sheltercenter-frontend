import { useCallback, useEffect } from "react"

import { Toggleable } from "../../core/components/formInputs/CheckboxInput"
import {
	BooleanInputProps,
	OptionalValueInputProps,
	RequiredEnumInputProps,
} from "../../core/components/formInputs/InputHandlers"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { ModalState } from "../../core/components/modal/Modal"
import { Outcome } from "../../enums/AppointmentEnums"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CheckOutAppointmentRequest } from "../../api/appointments/Requests"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { CheckOutFormFieldUpdater, useCheckOutFormState } from "./CheckOutFormState"

export function CheckOutForm({ apptID, modalState }: { apptID: number; modalState: ModalState }) {
	// --- form state ---
	const formState = useCheckOutFormState(),
		schedule = useScheduleState()
	const { setField, errors, ...fields } = formState

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
	}, [apptID, setField])

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
				setField("dog", "")
			}
		},
		[setField]
	)

	return (
		<div className="flex flex-col gap-y-3">
			<OutcomeField value={formData["outcome"]} onChange={handleOutcomeChange} />
			{isDogChoiceOutcome(formData["outcome"]) && <ChosenDogField {...bindField("dog")} />}
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

function ChosenDogField({ errors, value, onChange }: OptionalValueInputProps<string>) {
	return (
		<TextInput errors={errors} fieldLabel="Chosen Dog" showRequired value={value ?? ""} onChange={(e) => onChange(e)} />
	)
}

function SendSleepoverInfoField({ value, onChange }: BooleanInputProps) {
	return <Toggleable fieldLabel="Send Sleepover information?" value={value} onChange={onChange} />
}

function isDogChoiceOutcome(outcome: Outcome) {
	return [Outcome.ADOPTION, Outcome.FTA, Outcome.CHOSEN].includes(outcome)
}
