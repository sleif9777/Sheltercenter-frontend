import { useCallback, useEffect } from "react"

import { DateInput } from "../../core/components/formInputs/DateInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { DateTime } from "../../utils/DateTime"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { JumpToDateFormFieldUpdater, JumpToDateRequest, useJumpToDateFormState } from "./JumpToDateFormState"

export function JumpToDateForm({ modalState }: { modalState: ModalState }) {
	// --- form state ---
	const formState = useJumpToDateFormState()
	const schedule = useScheduleState()
	const { setField, errors, ...fields } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<JumpToDateRequest> = useCallback(() => {
		schedule.refresh(fields.newDate ? fields.newDate.GetISODate() : "")
		modalState.close()
	}, [fields.newDate, modalState, schedule])

	useEffect(() => {
		setField("newDate", new DateTime(schedule.isoDate))
	}, [schedule.isoDate, setField])

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={errors} formState={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formState,
	setField,
}: {
	errors: ErrorMap<JumpToDateRequest>
	formState: JumpToDateRequest
	setField: JumpToDateFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof JumpToDateRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: JumpToDateRequest[K]) => setField(field, v),
		value: formState[field],
	})

	return (
		<div className="flex max-w-2xs flex-col gap-y-3">
			<DateInput
				container={() => document.querySelector(".font-lato.relative.z-10") as HTMLElement}
				fieldLabel="Select a date"
				{...bindField("newDate")}
				onChange={(v) => setField("newDate", v)}
			/>
		</div>
	)
}
