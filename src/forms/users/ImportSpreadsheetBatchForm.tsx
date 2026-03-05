import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useState } from "react"

import { CardColor } from "../../core/components/card/CardEnums"
import { FileInput } from "../../core/components/formInputs/FileInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { ImportSpreadsheetBatchRequest } from "../../api/users/Requests"
import { ImportSpreadsheetBatchResponse } from "../../api/users/Responses"
import { UsersAPI } from "../../api/users/UsersAPI"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import {
	ImportSpreadsheetBatchFormFieldUpdater,
	useImportSpreadsheetBatchFormState,
} from "./ImportSpreadsheetBatchFormState"

export function ImportSpreadsheetBatchForm() {
	// --- form state ---
	const formData = useImportSpreadsheetBatchFormState()
	const { setField, errors, ...fields } = formData
	const [resetKey, setResetKey] = useState<number>(0)
	const [resp, setResp] = useState<ImportSpreadsheetBatchResponse>()

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<ImportSpreadsheetBatchRequest> = useCallback(
		async (req: ImportSpreadsheetBatchRequest) => {
			const resp = await new UsersAPI().ImportSpreadsheetBatch(req)
			setResp(resp)
			setResetKey((prev: number) => prev + 1) // Increment to force remount
		},
		[]
	)

	return (
		<div className="flex flex-col gap-y-2">
			<FormProvider
				colorOverride={CardColor.BLUE}
				formState={formData}
				hideCancel
				submitButtonProps={{
					icon: faFileArrowUp,
					label: "Import",
				}}
				onSubmit={handleSubmit}
			>
				<Fieldset errors={errors} formData={fields} resetKey={resetKey} setField={setField} />
			</FormProvider>
			{resp && <ResponseStatusMessage resp={resp} />}
		</div>
	)
}

function ResponseStatusMessage({ resp }: { resp: ImportSpreadsheetBatchResponse }) {
	const { successes, updates, failures, aversions } = resp

	const successStr = successes > 0 ? `${resp.successes} succeeded` : ""
	const updatesStr = updates > 0 ? `${resp.updates} updated` : ""
	const failuresStr = failures > 0 ? `${resp.failures} failed` : ""

	let statusStr = [successStr, updatesStr, failuresStr].filter((s) => s != "").join(", ")
	statusStr = statusStr == "" ? "No changes" : statusStr

	const level: MessageLevel =
		failures > 0 ? MessageLevel.Error : aversions.length > 0 ? MessageLevel.Warning : MessageLevel.Success

	return (
		<Message
			level={level}
			message={
				<>
					<div className="m-auto w-full text-center">{statusStr}</div>
					{aversions.length > 0 && (
						<div>
							<span>The following adopters were previously denied. You must manually set them to Approved:</span>
							<ul>
								{aversions.map((a, i) => (
									<li key={i}>
										<a href={`/adopters/detail/${a.ID}`}>{a.name}</a>
									</li>
								))}
							</ul>
						</div>
					)}
				</>
			}
		/>
	)
}

function Fieldset({
	errors,
	formData,
	resetKey,
	setField,
}: {
	errors: ErrorMap<ImportSpreadsheetBatchRequest>
	formData: ImportSpreadsheetBatchRequest
	resetKey: number
	setField: ImportSpreadsheetBatchFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof ImportSpreadsheetBatchRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: ImportSpreadsheetBatchRequest[K]) => setField(field, v),
		value: formData[field],
	})

	return (
		<>
			<FileInput {...bindField("importFile")} inputKey={resetKey} />
		</>
	)
}
