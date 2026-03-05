import { faArrowUp, faSave } from "@fortawesome/free-solid-svg-icons"
import { AxiosResponse } from "axios"
import { useCallback, useEffect } from "react"

import { EmailInput } from "../../core/components/formInputs/EmailInput"
import { RequiredEnumInputProps, StringInputProps } from "../../core/components/formInputs/InputHandlers"
import StatusTriState from "../../core/components/formInputs/StatusTriState"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast, ToastProps } from "../../core/components/messages/ToastProvider"
import { AdopterApprovalStatus } from "../../enums/AdopterEnums"
import { SaveUserFormRequest } from "../../api/users/Requests"
import { UsersAPI } from "../../api/users/UsersAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { UserFormContext, UserFormFieldUpdater, useUserFormState } from "./UserFormState"

export function UserForm({ context, defaults }: { context: UserFormContext; defaults?: Partial<SaveUserFormRequest> }) {
	// --- form state ---
	const formState = useUserFormState()
	const isEditContext = context == UserFormContext.EDIT

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<SaveUserFormRequest> = useCallback(async (req: SaveUserFormRequest) => {
		const resp = await new UsersAPI().SaveUserForm(req)
		showToast(getToastFromResp(resp))
	}, [])

	const { reset, setAll, setField, errors, ...fields } = formState

	useEffect(() => {
		if (defaults && context == UserFormContext.EDIT) {
			setAll(defaults)
		} else if (context == UserFormContext.NEW) {
			reset()
		}

		setField("context", context)
	}, [context, defaults, reset, setAll, setField])

	return (
		<div>
			<FormProvider
				avoidReset={isEditContext}
				cancelButtonProps={{
					tooltip: "",
				}}
				formState={formState}
				submitButtonProps={{
					icon: isEditContext ? faSave : faArrowUp,
					label: isEditContext ? "Save" : "Upload",
				}}
				onSubmit={handleSubmit}
			>
				<Fieldset context={context} errors={errors} formData={fields} setField={setField} />
			</FormProvider>
		</div>
	)
}

function Fieldset({
	context,
	errors,
	formData,
	setField,
}: {
	context: UserFormContext
	errors: ErrorMap<SaveUserFormRequest>
	formData: SaveUserFormRequest
	setField: UserFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof SaveUserFormRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: SaveUserFormRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<div className="flex flex-col gap-y-1">
			<div className="flex flex-row gap-x-1">
				<NameField {...bindField("firstName")} label="First Name" />
				<NameField {...bindField("lastName")} label="Last Name" />
			</div>
			<EmailInput
				addlProps={{
					disabled: context == UserFormContext.EDIT,
				}}
				showRequired
				{...bindField("primaryEmail")}
			/>
			<AdopterStatusField {...bindField("status")} />
			<NotesField {...bindField("internalNotes")} />
		</div>
	)
}

function NameField({
	errors,
	value,
	onChange,
	label,
}: {
	label: string
} & StringInputProps) {
	return <TextInput errors={errors} fieldLabel={label} showRequired value={value} onChange={(e) => onChange(e)} />
}

export function AdopterStatusField({ errors, value, onChange }: RequiredEnumInputProps<AdopterApprovalStatus>) {
	return (
		<StatusTriState
			errors={errors}
			fieldLabel="Status"
			value={value}
			onChange={(newStatus) => {
				onChange(newStatus)
			}}
		/>
	)
}

function NotesField({ errors, value, onChange }: StringInputProps) {
	return (
		<TextInput
			addlProps={{
				multiline: true,
				rows: 4,
			}}
			errors={errors}
			fieldLabel="Internal Notes"
			value={value}
			onChange={(e) => onChange(e)}
		/>
	)
}

function getToastFromResp(resp: AxiosResponse): ToastProps {
	switch (resp.status) {
		case 201:
			return {
				level: MessageLevel.Success,
				message: "Adopter created",
			}
		case 202:
			return {
				level: MessageLevel.Success,
				message: "Adopter updated",
			}
		case 203:
			return {
				level: MessageLevel.Error,
				message: <BlockedAdopterWarning adopterID={0} adopterName="Q Q" />,
			}
		default:
			return {
				level: MessageLevel.Error,
				message: "Failed to save",
			}
	}
}

function BlockedAdopterWarning({ adopterID, adopterName }: { adopterID: number; adopterName: string }) {
	return (
		<div>
			<span>Adopter was previously blocked. Review and update manually:</span>
			<ul>
				<li>
					<a href={`/adopters/manage/${adopterID}`} target="_blank">
						{adopterName}
					</a>
				</li>
			</ul>
		</div>
	)
}
