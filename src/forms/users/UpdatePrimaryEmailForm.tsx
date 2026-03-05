import { useCallback, useEffect } from "react"

import { EmailInput } from "../../core/components/formInputs/EmailInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { UpdatePrimaryEmailRequest } from "../../api/users/Requests"
import { UsersAPI } from "../../api/users/UsersAPI"
import { FormProvider } from "../FormProvider"
import { UpdatePrimaryEmailFormFieldUpdater, useUpdatePrimaryEmailFormState } from "./UpdatePrimaryEmailFormState"
import { ModalState } from "../../core/components/modal/Modal"
import { useAdopterDetailsState } from "../../pages/adopter/AdopterDetailsAppState"

export function UpdatePrimaryEmailForm({ modalState, primaryEmail }: { modalState: ModalState; primaryEmail: string }) {
	// --- form state ---
	const formData = useUpdatePrimaryEmailFormState(),
		activityState = useAdopterDetailsState()
	const { setField, ...fields } = formData

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<UpdatePrimaryEmailRequest> = useCallback(
		async (req: UpdatePrimaryEmailRequest) => {
			const resp = await new UsersAPI().UpdatePrimaryEmail(req)

			if (resp.status == 200) {
				showToast({ level: MessageLevel.Success, message: "Email updated!" })
			} else if (resp.status == 226) {
				showToast({ level: MessageLevel.Error, message: "Adopter with email " + req.newEmail + " already exists." })
			}

			activityState.refresh()
		},
		[activityState]
	)

	useEffect(() => {
		setField("newEmail", primaryEmail) // set default
		setField("primaryEmail", primaryEmail)
	}, [primaryEmail, setField])

	return (
		<FormProvider formState={formData} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	formData,
	setField,
}: {
	formData: UpdatePrimaryEmailRequest
	setField: UpdatePrimaryEmailFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof UpdatePrimaryEmailRequest>(field: K) => ({
		onChange: (v: UpdatePrimaryEmailRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<>
			<EmailInput {...bindField("newEmail")} />
		</>
	)
}
