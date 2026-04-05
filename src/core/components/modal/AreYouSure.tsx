import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

import { FormProvider } from "../../../forms/FormProvider"
import { createFormState } from "../../../forms/FormState"
import { FormSubmitHandler } from "../formInputs/SubmissionButton"
import { Modal, ModalState } from "./Modal"

export interface AreYouSureProps {
	youWantTo: string
	modalState: ModalState
	modalTitle: string
	onSubmit: FormSubmitHandler<{}>
}

const useEmptyFormState = createFormState<{}>({})

export function AreYouSure({ youWantTo, modalState, modalTitle, onSubmit }: AreYouSureProps) {
	return (
		<Modal modalState={modalState} modalTitle={modalTitle}>
			<FormProvider
				cancelButtonProps={{
					label: "Go Back",
					tooltip: "",
				}}
				formState={useEmptyFormState()}
				modalState={modalState}
				submitButtonProps={{
					icon: faArrowRight,
					label: "Continue",
				}}
				onCancel={modalState.close}
				onSubmit={onSubmit}
			>
				<div className="text-left text-[16px] font-normal text-black normal-case">
					Are you sure you want to {youWantTo}?
				</div>
			</FormProvider>
		</Modal>
	)
}
