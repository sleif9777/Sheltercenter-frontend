import { faShieldDog } from "@fortawesome/free-solid-svg-icons"
import { KeyboardEventHandler, useCallback } from "react"

import { EmailInput } from "../../core/components/formInputs/EmailInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { useSessionState } from "../../core/session/SessionState"
import { PrimaryEmailRequest } from "../../api/users/Requests"
import { UsersAPI } from "../../api/users/UsersAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { LoginFormFieldUpdater, useLoginFormState } from "./LoginFormState"

export function LoginForm({ debug }: { debug?: boolean }) {
	// --- form state ---
	const formState = useLoginFormState()
	const session = useSessionState()
	const { setField, getPostRequest, errors, ...fields } = formState

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<PrimaryEmailRequest> = useCallback(
		async (req: PrimaryEmailRequest) => {
			const resp = await new UsersAPI().LogIn(req)

			if (resp.status == 202) {
				session.setUpSession(resp.data)
			} else if (resp.status == 401) {
				showToast({ level: MessageLevel.Error, message: "Could not authenticate this email" })
			} else if (resp.status == 418) {
				showToast({
					level: MessageLevel.Warning,
					message: "Your application is expired. Redirecting you to a new application...",
				})
				setTimeout(() => {
					window.open("https://www.shelterluv.com/matchme/adopt/SGNC/Dog", "_blank")
				}, 1500)
			}
		},
		[session]
	)

	const handleEnter: KeyboardEventHandler<HTMLInputElement> = useCallback(
		async (e) => {
			if (e.key == "Enter") {
				e.preventDefault()
				await handleSubmit(getPostRequest())
			}
		},
		[getPostRequest, handleSubmit]
	)

	return (
		<FormProvider
			formState={formState}
			hideCancel
			submitButtonProps={{
				icon: faShieldDog,
				label: "LOG IN",
			}}
			onSubmit={handleSubmit}
		>
			<Fieldset errors={errors} formData={fields} handleEnter={handleEnter} setField={setField} />
			{debug && <pre>{JSON.stringify(session, null, 2)}</pre>}
		</FormProvider>
	)
}

function Fieldset({
	formData,
	setField,
	errors,
	handleEnter,
}: {
	formData: PrimaryEmailRequest
	setField: LoginFormFieldUpdater
	errors: ErrorMap<PrimaryEmailRequest>
	handleEnter: KeyboardEventHandler<HTMLInputElement>
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof PrimaryEmailRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: PrimaryEmailRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<div>
			<EmailInput {...bindField("primaryEmail")} className="m-auto" enterKeyHandler={handleEnter} showRequired />
		</div>
	)
}
