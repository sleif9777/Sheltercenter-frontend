import { useCallback, useEffect } from "react"

import { StringInputProps } from "../../core/components/formInputs/InputHandlers"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { ModalState } from "../../core/components/modal/Modal"
import { useChosenBoardState } from "../../pages/chosenBoard/ChosenBoardAppState"
import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { ChangeDogRequest } from "../../api/pendingAdoptions/Requests"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { ChangeDogFormFieldUpdater, useChangeDogFormState } from "./ChangeDogFormState"

export function ChangeDogForm({ adoptionID, modalState }: { adoptionID: number; modalState: ModalState }) {
	// --- form state ---
	const formData = useChangeDogFormState(),
		board = useChosenBoardState()

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<ChangeDogRequest> = useCallback(async (req: ChangeDogRequest) => {
		await new PendingAdoptionsAPI().ChangeDog(req)
		board.refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const { setField, errors, ...fields } = formData

	useEffect(() => {
		setField("adoptionID", adoptionID)
	}, [adoptionID, setField])

	// TODO: make FormProvider component
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
	errors: ErrorMap<ChangeDogRequest>
	formData: ChangeDogRequest
	setField: ChangeDogFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof ChangeDogRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: ChangeDogRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<>
			<NewDogField {...bindField("newDog")} />
		</>
	)
}

function NewDogField({ errors, value, onChange }: StringInputProps) {
	return <TextInput errors={errors} fieldLabel="New Dog" showRequired value={value} onChange={(e) => onChange(e)} />
}
