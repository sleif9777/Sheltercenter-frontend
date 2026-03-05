import { useCallback } from "react"

import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { ModalState } from "../../core/components/modal/Modal"
import { FormProvider } from "../FormProvider"
import { useWatchlistHelpFormState, WatchlistHelpFields } from "./WatchlistHelpFormState"
import { useSessionState } from "../../core/session/SessionState"
import { Message, MessageLevel } from "../../core/components/messages/Message"

export function WatchlistHelpForm({ modalState }: { modalState: ModalState }) {
	// --- form state ---
	const formData = useWatchlistHelpFormState(),
		session = useSessionState()

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<WatchlistHelpFields> = useCallback(async () => {
		session.acknowledgeWatchlist()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// TODO: make FormProvider component
	return (
		<FormProvider
			errorTooltip="You must acknowledge all disclaimers"
			formState={formData}
			hideCancel
			modalState={modalState}
			submitButtonProps={{
				label: "I Understand",
			}}
			onSubmit={handleSubmit}
		>
			<div className="text-left">
				<ul className="list-outside list-disc space-y-2 pl-5">
					<li>This page updates every 30 minutes.</li>
					<li>
						Click the <b>Add to List</b> button to add a dog to your watchlist. Click the <b>Remove from List</b> button to
						remove a dog from your watchlist.
					</li>
					<li>
						When you check in for your appointment, this information will be given to your counselor to help find potential
						matches.
					</li>
					<li>We will auto-email you if a dog you added to your watchlist is no longer available.</li>
				</ul>
			</div>
			<NoHoldsAcknowledgementField />
			<SoleResponsibilityAcknowledgementField />
		</FormProvider>
	)
}

function NoHoldsAcknowledgementField() {
	return (
		<>
			<Message
				largeIcon
				level={MessageLevel.Error}
				message={
					<div>
						<div className="text-lg underline">IMPORTANT!</div>
						Adding dogs to your watchlist does NOT place them on any sort of hold. To give all dogs the most opportunities to
						find a forever home, Saving Grace is a first-come, first-serve facility.
					</div>
				}
			/>
		</>
	)
}

function SoleResponsibilityAcknowledgementField() {
	return (
		<>
			<Message
				largeIcon
				level={MessageLevel.Error}
				message={
					<div>
						<div className="text-lg underline">IMPORTANT!</div>
						Our volunteers can see your watchlist, but do NOT have the ability (or time) to manage it for you. You are solely
						responsible for updating your watchlist.
					</div>
				}
			/>
		</>
	)
}
