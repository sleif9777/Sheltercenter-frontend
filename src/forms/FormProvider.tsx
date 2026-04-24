import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { ReactNode, useCallback } from "react"

import { CardColor } from "../core/components/card/CardEnums"
import {
	ButtonProps,
	CancelClickHandler,
	FormSubmitHandler,
	SubmissionButton,
	SubmitClickHandler,
} from "../core/components/formInputs/SubmissionButton"
import { TooltipProvider } from "../core/components/messages/TooltipProvider"
import { ModalState } from "../core/components/modal/Modal"
import { FormState } from "./FormState"

export function FormProvider<T extends object>({
	avoidReset,
	cancelButtonProps,
	submitButtonProps,
	colorOverride,
	children,
	debug,
	errorTooltip,
	formState,
	hideCancel,
	modalState,
	onSubmit,
	onCancel,
}: {
	avoidReset?: boolean
	cancelButtonProps?: ButtonProps
	submitButtonProps?: ButtonProps
	colorOverride?: CardColor
	children: ReactNode
	debug?: boolean
	errorTooltip?: string
	hideCancel?: boolean
	formState: FormState<T> & T
	modalState?: ModalState
	onSubmit: FormSubmitHandler<T>
	onCancel?: () => void
}) {
	const { getPostRequest, reset, errors, isValid } = formState

	const { border } = {
		[CardColor.RED]: { bg: "bg-red-200", border: "border-red-800", text: "text-red-800" },
		[CardColor.GRAY]: { bg: "bg-gray-100", border: "border-gray-700", text: "text-gray-900" },
		[CardColor.BLUE]: { bg: "bg-blue-100", border: "border-blue-900", text: "text-blue-900" },
		[CardColor.PINK]: { bg: "bg-pink-100", border: "border-pink-800", text: "text-pink-800" },
		[CardColor.PURPLE]: { bg: "bg-purple-100", border: "border-purple-800", text: "text-purple-800" },
	}[colorOverride ?? CardColor.PINK]

	const handleSubmit: SubmitClickHandler = useCallback(
		async (e) => {
			e.preventDefault()
			if (!isValid) {
				return
			}

			await onSubmit(getPostRequest())

			if (!avoidReset) {
				reset()
			}

			modalState?.close()
		},
		[isValid, onSubmit, getPostRequest, avoidReset, modalState, reset]
	)

	const handleCancel: CancelClickHandler = useCallback(() => {
		reset()
		onCancel?.()
		modalState?.close()
	}, [reset, onCancel, modalState])

	const allErrors = Object.values(errors)
		.flat()
		.map((msg) => msg)

	return (
		<form className="flex min-h-0 w-full flex-1 flex-col text-black" onSubmit={handleSubmit}>
			{/* Scrollable body */}
			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				{children}
				{debug && (
					<div className="text-center text-[8pt]">
						<pre className="wrap-break-word whitespace-normal">
							<b>POST body: </b>
							{JSON.stringify(getPostRequest(), null, 2)}
						</pre>
						<pre className="wrap-break-word whitespace-normal">
							<b>Errors: </b>
							{JSON.stringify(errors, null, 2)}
						</pre>
					</div>
				)}
			</div>

			{/* Sticky footer */}
			<div className={`mt-3 flex shrink-0 flex-row justify-end gap-x-3 border-t ${border} py-3 text-black`}>
				{!hideCancel && (
					<TooltipProvider tooltip={cancelButtonProps?.tooltip ?? "Close without saving"}>
						<SubmissionButton
							addlProps={{
								type: "button",
							}}
							colorOverride={colorOverride}
							icon={cancelButtonProps?.icon ?? faXmark}
							label={cancelButtonProps?.label ?? "Cancel"}
							onClick={handleCancel}
						/>
					</TooltipProvider>
				)}
				<TooltipProvider tooltip={allErrors.length > 0 ? (errorTooltip ?? "Fix errors to submit") : ""}>
					<SubmissionButton
						addlProps={{
							type: "submit",
						}}
						colorOverride={colorOverride}
						disabled={!isValid}
						icon={submitButtonProps?.icon ?? faCheck}
						label={submitButtonProps?.label ?? "Submit"}
					/>
				</TooltipProvider>
			</div>
		</form>
	)
}
