import { faCarSide, faEnvelopeCircleCheck } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useState } from "react"
import ReactQuill from "react-quill"

import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import { RichTextInput } from "../../core/components/formInputs/RichTextInput"
import { SubmissionButton } from "../../core/components/formInputs/SubmissionButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { ModalState } from "../../core/components/modal/Modal"
import { PendingAdoptionStatus } from "../../enums/PendingAdoptionEnums"
import { IPendingAdoption } from "../../models/PendingAdoptionModels"
import { deltaToPlainText } from "../users/MessageForm"

type QuillOp = { insert: string; attributes?: { bold?: boolean } }

function getScheduleContext() {
	// JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
	switch (new Date().getDay()) {
		case 3: // Wed
			return { nextBusDay: "tomorrow", todayClose: "6:00pm", openHour: "1:00pm", closeHour: "6:00pm" }
		case 5: // Fri
			return { nextBusDay: "tomorrow", todayClose: "6:00pm", openHour: "12:00pm", closeHour: "3:00pm" }
		case 6: // Sat
			return { nextBusDay: "on Monday", todayClose: "3:00pm", openHour: "12:00pm", closeHour: "6:00pm" }
		default: // Sun/Mon/Tue/Thu
			return { nextBusDay: "tomorrow", todayClose: "6:00pm", openHour: "12:00pm", closeHour: "6:00pm" }
	}
}

function buildDefaultMessage(adoption: IPendingAdoption): ReactQuill.Value {
	const { nextBusDay, todayClose, openHour, closeHour } = getScheduleContext()
	const { dog, heartwormPositive } = adoption
	const firstName = adoption.adopter.firstName

	const ops: QuillOp[] = []
	const t = (s: string) => ops.push({ insert: s })
	const b = (s: string) => ops.push({ insert: s, attributes: { bold: true } })
	const nl = (n = 1) => ops.push({ insert: "\n".repeat(n) })

	t(`Hi ${firstName},`); nl(2)
	t(`Great news! ${dog} has completed vetting and is ready to head home with you!`); nl(2)

	if (heartwormPositive) {
		t(`We do want to let you know that ${dog} has tested positive for heartworms. This is fairly common in the Carolinas and simply means that they were bitten by an infected mosquito. Don't worry—heartworms are not contagious to other pets or humans, and the good news is they're treatable!`); nl(2)
		t(`We've attached two documents with details about our heartworm treatment program and your options. You can either work directly with your vet to provide the treatment, or we can take care of it through our foster-to-adopt (FTA) program. If you choose the FTA option, ${dog} will come back to us for a series of two treatments, and will remain legally owned by us throughout the duration of the treatment period. However, they will go home with you as a foster for the time being and can start becoming acclimated to your home and routine.`); nl(2)
		t(`Once you're ready to move forward, we can schedule an appointment to complete the FTA agreement, get you all the materials you'll need, and hand over your new best friend!`); nl(2)
	}

	t(`We're ready to complete the pickup anytime today up until ${todayClose}. We'll also be open ${nextBusDay} from ${openHour} to ${closeHour}. The earlier you can come, the better, as we have lots of adopters coming through! `)
	b(`Please reach out to let us know what time works best for you — we are unable to accommodate walk-ins.`)
	t(` Just a heads-up: please bring a collar and leash so you can take your new pet home right away!`); nl(2)

	if (!heartwormPositive) {
		t(`It's in ${dog}'s best interest to go home as soon as possible, so please try to schedule your pickup within the next 48 hours. If we don't hear from you by then, we'll need to make ${dog} available to other potential forever families.`); nl(2)
		t(`When you come, please bring your driver's license (so we can make a copy) and a method of payment for the adoption fee of $395. You can pay by cash or credit/debit card, but we can't accept checks or split payments. If you're paying by card, you'll also need your cell phone.`); nl(2)
	}

	t(`We can't wait to get ${dog} settled into their new home with you. Thanks so much for your patience—it's totally worth the wait!`)

	return { ops } as ReactQuill.Value
}

export function ReadyToRollForm({
	adoption,
	modalState,
	onSuccess,
}: {
	adoption: IPendingAdoption
	modalState: ModalState
	onSuccess: () => void
}) {
	const [message, setMessage] = useState<ReactQuill.Value>(() => buildDefaultMessage(adoption))
	const [sendEmail, setSendEmail] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = useCallback(async () => {
		if (isSubmitting) return
		setIsSubmitting(true)
		try {
			await new PendingAdoptionsAPI().MarkStatus(
				adoption.ID,
				PendingAdoptionStatus.READY_TO_ROLL,
				sendEmail ? deltaToPlainText(message) : undefined,
				sendEmail,
			)
			showToast({
				level: MessageLevel.Success,
				message: sendEmail ? "Marked ready to roll — email sent!" : "Marked ready to roll.",
			})
			onSuccess()
			modalState.close()
		} catch {
			showToast({ level: MessageLevel.Error, message: "Something went wrong. Please try again." })
		} finally {
			setIsSubmitting(false)
		}
	}, [adoption.ID, isSubmitting, message, modalState, onSuccess, sendEmail])

	return (
		<div className="flex flex-col gap-y-3">
			<CheckboxInput
				errors={[]}
				fieldLabel="Send email to adopter"
				value={sendEmail}
				onChange={setSendEmail}
			/>
			{sendEmail && (
				<RichTextInput
					errors={[]}
					fieldLabel="Message"
					value={message}
					onChange={setMessage}
				/>
			)}
			<div className="flex justify-end border-t border-pink-800 pt-3">
				<SubmissionButton
					disabled={isSubmitting}
					icon={sendEmail ? faEnvelopeCircleCheck : faCarSide}
					label={isSubmitting ? "Saving..." : sendEmail ? "Send & Mark Ready to Roll" : "Mark Ready to Roll"}
					onClick={handleSubmit}
				/>
			</div>
		</div>
	)
}
