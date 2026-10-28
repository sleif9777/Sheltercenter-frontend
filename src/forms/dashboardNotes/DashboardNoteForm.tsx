import { HttpStatusCode } from "axios"
import { useCallback } from "react"

import { DashboardNotesAPI } from "../../api/dashboardNotes/DashboardNotesAPI"
import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import { DateInput } from "../../core/components/formInputs/DateInput"
import { FormSubmitHandler, SubmissionButton } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { ModalState } from "../../core/components/modal/Modal"
import { useDashboardsState } from "../../pages/dashboards/DashboardsAppState"
import { DateTime } from "../../utils/DateTime"
import { DogSelectField } from "../appointments/CheckOutForm"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import {
	DashboardNoteFormData,
	DashboardNoteFormFieldUpdater,
	NOTE_QUICK_OPTIONS,
	toCreateDashboardNoteRequest,
	useDashboardNoteFormState,
} from "./DashboardNoteFormState"

export function DashboardNoteForm({ modalState }: { modalState: ModalState }) {
	const formState = useDashboardNoteFormState()

	const handleSubmit: FormSubmitHandler<DashboardNoteFormData> = useCallback(async (data: DashboardNoteFormData) => {
		// buildAndPost resolves with the error rather than rejecting, so check the status
		const resp = await new DashboardNotesAPI().CreateDashboardNote(toCreateDashboardNoteRequest(data))
		if (resp?.status !== HttpStatusCode.Created) {
			showToast({ level: MessageLevel.Error, message: "Could not add the note. Please try again." })
		}
		useDashboardsState.getState().refresh()
	}, [])

	const { setField, ...fields } = formState

	return (
		<FormProvider formState={formState} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={formState.errors} formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<DashboardNoteFormData>
	formData: DashboardNoteFormData
	setField: DashboardNoteFormFieldUpdater
}) {
	const handleDogChange = useCallback(
		async (value: string | null) => {
			setField("dogID", parseInt(value ?? "0"))
		},
		[setField]
	)

	const handleNotListedChange = useCallback(
		(checked: boolean) => {
			setField("notListed", checked)
			if (checked) {
				setField("dogID", 0)
			} else {
				setField("dogName", "")
			}
		},
		[setField]
	)

	const handleExpiresChange = useCallback(
		(checked: boolean) => {
			setField("expires", checked)
			if (!checked) {
				setField("showUntil", "")
			}
		},
		[setField]
	)

	return (
		<div className="flex flex-col gap-y-1">
			{!formData.notListed && <DogSelectField errors={errors["dogID"]} fieldLabel="Dog" value={formData.dogID.toString()} onChange={handleDogChange} />}
			<CheckboxInput fieldLabel="Dog Not Listed" value={formData.notListed} onChange={handleNotListedChange} />
			{formData.notListed && (
				<TextInput errors={errors["dogName"]} fieldLabel="Dog" showRequired value={formData.dogName} onChange={(v) => setField("dogName", v)} />
			)}
			<TextInput errors={errors["note"]} fieldLabel="Note" showRequired value={formData.note} onChange={(v) => setField("note", v)} />
			<div className="flex flex-row gap-x-2">
				{NOTE_QUICK_OPTIONS.map((option) => (
					<SubmissionButton addlProps={{ type: "button" }} key={option} label={option} onClick={() => setField("note", option)} />
				))}
			</div>
			<CheckboxInput fieldLabel="Remove Automatically" value={formData.expires} onChange={handleExpiresChange} />
			{formData.expires && (
				<div className="max-w-2xs">
					<DateInput
						addlProps={{
							cleanable: false,
							// Any day, Sundays included, from today on
							shouldDisableDate: (d) => new DateTime(d.toISOString()).GetISODate() < new DateTime().GetISODate(),
						}}
						container={() => document.querySelector(".font-lato.relative.z-10") as HTMLElement}
						currentYearOnly={false}
						errors={errors["showUntil"]}
						fieldLabel="Last Day Shown"
						showRequired
						value={formData.showUntil ? DateTime.FromISODate(formData.showUntil) : undefined}
						onChange={(v) => setField("showUntil", v?.GetISODate() ?? "")}
					/>
				</div>
			)}
		</div>
	)
}
