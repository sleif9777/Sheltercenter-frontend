import { useCallback, useEffect } from "react"

import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TimeChangeHandler, TimeInput } from "../../core/components/formInputs/TimeInput"
import { ModalState } from "../../core/components/modal/Modal"
import { Weekday } from "../../enums/TemplateEnums"
import { useTemplateState } from "../../pages/template/TemplateAppState"
import { CreateTemplateRequest } from "../../api/templates/Requests"
import { TemplatesAPI } from "../../api/templates/TemplatesAPI"
import { AppointmentTypeField } from "../appointments/AppointmentForm"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { TemplateFormFieldUpdater, useTemplateFormState } from "./TemplateFormState"

export function TemplateForm({ modalState, weekday }: { modalState?: ModalState; weekday: Weekday }) {
	// --- form state ---
	const formState = useTemplateFormState()
	const template = useTemplateState()
	const { setField, errors, ...fields } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CreateTemplateRequest> = useCallback(
		async (req: CreateTemplateRequest) => {
			await new TemplatesAPI().CreateTemplate(req)
			template.refresh()
		},
		[template]
	)

	useEffect(() => {
		setField("weekday", weekday)
	}, [setField, weekday])

	// TODO: make FormProvider component
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
	errors: ErrorMap<CreateTemplateRequest>
	formData: CreateTemplateRequest
	setField: TemplateFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CreateTemplateRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: CreateTemplateRequest[K]) => setField(field, v),
		value: formData[field],
	})

	const timeFieldErrors = [...(errors["minute"] ?? []), ...(errors["hour"] ?? [])]

	return (
		<>
			<TemplateTimeField errors={timeFieldErrors} hour={formData.hour} minute={formData.minute} setField={setField} />
			<AppointmentTypeField {...bindField("type")} isTemplate />
		</>
	)
}

function TemplateTimeField({
	errors,
	hour,
	minute,
	setField,
}: {
	errors: string[]
	hour: number
	minute: number
	setField: TemplateFormFieldUpdater
}) {
	const handleTimeChange: TimeChangeHandler = useCallback(
		(m) => {
			setField("hour", m?.get("hour") ?? 0)
			setField("minute", m?.get("minute") ?? 0)
		},
		[setField]
	)

	return <TimeInput errors={errors} fieldLabel="Time" hour={hour} minute={minute} onChange={handleTimeChange} />
}
