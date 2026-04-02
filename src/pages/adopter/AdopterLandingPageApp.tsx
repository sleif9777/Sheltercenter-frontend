import { faShieldDog } from "@fortawesome/free-solid-svg-icons"
import { useCallback } from "react"
import ReactQuill from "react-quill"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import Logo from "../../assets/logo.png"
import UserInstructions from "../../assets/UserInstructions.jpg"
import { AppointmentCard } from "../../cards/appointments/AppointmentCard"
import { AppointmentCardContext } from "../../cards/appointments/Types"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { AreYouSure } from "../../core/components/modal/AreYouSure"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import { MessageForm, QuickText } from "../../forms/users/MessageForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { useScheduleState } from "../schedule/ScheduleAppState"

export function AdopterLandingPageApp() {
	const session = useSessionState()

	return (
		<FullWidthPage title={<WelcomeTitle />}>
			<div className="mx-5 mt-3 flex flex-col gap-y-1 border-t border-pink-800 py-2">
				{session.user?.restrictCalendar ? (
					<div className="flex flex-col gap-y-1">
						<PlaceholderText iconDef={faShieldDog} text={"Congratulations on your adoption!"} />
						<div className="text-lg">
							<div>Calendar access is restricted after choosing a dog or completing adoption.</div>
							<div>
								Use the <span className="font-bold text-pink-700">Message Adoptions</span> button for futher assistance,
								including any of the following:
							</div>
						</div>
						<div className="m-auto rounded border-2 border-pink-700 bg-pink-200 p-2">
							<ul>
								<li>- My dog is pending clearance, and I want to visit.</li>
								<li>- My dog is ready to go home, and I need arrange up a pickup time.</li>
								<li>- I need to surrender my adopted or foster-to-adopt dog.</li>
								<li>- I want to schedule a new adoption appointment.</li>
							</ul>
						</div>
						<MessageAdoptionsButton includeQTs />
					</div>
				) : (
					<>
						<div className="flex flex-row flex-wrap gap-x-4">
							{session.user?.currentAppt ? (
								<>
									<div className="text-lg">
										Your current appointment is <span className="font-semibold">{session.user.currentAppt.instantDisplay}.</span>
										<CancelAppointmentButton />
										<BookAppointmentButton />
										<MessageAdoptionsButton />
										<UpdatePreferencesButton />
									</div>
									<div className="m-auto flex w-sm flex-col gap-y-1">
										{session.user?.currentAppt?.ID && (
											<AppointmentCard
												apptID={session.user?.currentAppt?.ID}
												context={AppointmentCardContext.CURRENT_APPOINTMENT}
											/>
										)}
									</div>
								</>
							) : (
								<div className="m-auto text-lg">
									<span>You do not have an appointment booked.</span>
									<BookAppointmentButton />
									<ManageWatchlistButton />
									<UpdatePreferencesButton />
									<MessageAdoptionsButton />
								</div>
							)}
						</div>
						<AdoptionProcess />
					</>
				)}
			</div>
		</FullWidthPage>
	)
}

function WelcomeTitle() {
	const session = useSessionState()

	return (
		<div className="m-auto flex w-full flex-row items-center justify-center gap-x-5">
			<img className="md:hidden" src={Logo} />
			<span>{`Welcome, ${session.user?.firstName}!`}</span>
		</div>
	)
}

export function CancelAppointmentButton() {
	const session = useSessionState(),
		modalState = useModalState(),
		schedule = useScheduleState()
	const currentAppt = session.user?.currentAppt

	const handleSubmit = useCallback(async () => {
		await new AppointmentsAPI().CancelAppointment(currentAppt!.ID)
		showToast({ level: MessageLevel.Error, message: "Appointment cancelled." })
		session.removeCurrentAppt()
		schedule.refresh()
	}, [currentAppt, session, schedule])

	if (!currentAppt) {
		return
	}

	return (
		<>
			<LargeButton label={`Cancel My Appointment (${currentAppt.instantDisplay})`} onClick={modalState.open} />
			<AreYouSure
				modalState={modalState}
				modalTitle={"Cancel Appointment"}
				youWantTo={"cancel your appointment"}
				onSubmit={handleSubmit}
			/>
		</>
	)
}

function UpdatePreferencesButton() {
	const handleClick = useCallback(async () => {
		window.location.href = "/preferences/"
	}, [])

	return <LargeButton label="Update My Preferences" onClick={handleClick} />
}

function ManageWatchlistButton() {
	const handleClick = useCallback(async () => {
		window.location.href = "/watchlist/"
	}, [])

	return <LargeButton label="Manage My Dog Watchlist" onClick={handleClick} />
}

function BookAppointmentButton() {
	const session = useSessionState()
	const currentAppt = session.user?.currentAppt

	const handleClick = useCallback(async () => {
		window.location.href = "/calendar/"
	}, [])

	if (currentAppt) {
		return
	}

	return <LargeButton label="Book New Appointment" onClick={handleClick} />
}

function MessageAdoptionsButton({ includeQTs }: { includeQTs?: boolean }) {
	const session = useSessionState(),
		modalState = useModalState()
	let quickTexts: QuickText[] = []

	if (includeQTs) {
		quickTexts = createQuickTexts()
	}

	if (!session.user?.adopterID) {
		return
	}

	return (
		<>
			<LargeButton label="Message Adoptions" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle={"Message Adoptions"}>
				<MessageForm
					adopterID={session.user?.adopterID}
					hideSubject
					isMessageToAdoptions
					modalState={modalState}
					quickTextOptions={includeQTs ? quickTexts : undefined}
				/>
			</Modal>
		</>
	)
}

function AdoptionProcess() {
	const modalState = useModalState()

	return (
		<>
			<Modal modalState={modalState} modalTitle="Adoption Process">
				<img className="m-auto w-full" src={UserInstructions} />
			</Modal>
			<TooltipProvider tooltip="Click to expand">
				<button className="cursor-nesw-resize hover:opacity-70" onClick={modalState.open}>
					<img className="m-auto mt-3 w-[70%]" src={UserInstructions} />
				</button>
			</TooltipProvider>
		</>
	)
}

export enum AdopterInquiryTemplate {
	VISIT_MY_DOG = 1,
	SURRENDER_MY_DOG = 2,
	CALENDAR_ACCESS = 3,
	PICK_UP_MY_DOG = 4,
	BLANK = 0,
}

export const AdopterInquiryTemplateLabel: Record<AdopterInquiryTemplate, string> = {
	[AdopterInquiryTemplate.VISIT_MY_DOG]: "Visit My Dog",
	[AdopterInquiryTemplate.SURRENDER_MY_DOG]: "Surrender My Dog",
	[AdopterInquiryTemplate.CALENDAR_ACCESS]: "Calendar Access",
	[AdopterInquiryTemplate.PICK_UP_MY_DOG]: "Pick Up My Dog",
	[AdopterInquiryTemplate.BLANK]: "Blank Template",
}

export function getVisitMyDogContent(): ReactQuill.Value {
	return {
		ops: [
			{ insert: "I am requesting to visit my chosen dog " },
			{ attributes: { bold: true }, insert: "$$$DOG NAME$$$" },
			{ insert: ".\n\n" },
			{ insert: "My preferred days/times are:\n" },
			{ attributes: { bold: true }, insert: "$$$PREFERRED DATE/TIME 1$$$\n\n" },
			{ attributes: { bold: true }, insert: "$$$PREFERRED DATE/TIME 2$$$\n\n" },
			{ attributes: { bold: true }, insert: "$$$PREFERRED DATE/TIME 3$$$\n\n" },
		],
	} as ReactQuill.Value
}

export function getSurrenderMyDogContent(): ReactQuill.Value {
	return {
		ops: [
			{ insert: "I need to discuss surrendering " },
			{ attributes: { bold: true }, insert: "$$$DOG'S NAME (FROM ORIGINAL ADOPTION PAPERWORK)$$$" },
			{ insert: ".\n\n" },
			{ insert: "Adoption Date:\n" },
			{ attributes: { bold: true }, insert: "$$$ADOPTION DATE$$$\n\n" },
			{ insert: "Microchip Number:\n" },
			{ attributes: { bold: true }, insert: "$$$MICROCHIP NUMBER$$$\n\n" },
			{ insert: "Good with Dogs:\n" },
			{ attributes: { bold: true }, insert: "$$$GOOD WITH DOGS?$$$\n\n" },
			{ insert: "Good with Cats:\n" },
			{ attributes: { bold: true }, insert: "$$$GOOD WITH CATS?$$$\n\n" },
			{ insert: "Good with Kids:\n" },
			{ attributes: { bold: true }, insert: "$$$GOOD WITH KIDS?$$$\n\n" },
			{ insert: "Reason for Surrender:\n" },
			{ attributes: { bold: true }, insert: "$$$REASON FOR SURRENDER?$$$\n\n" },
			{ insert: "Behavioral Issues:\n" },
			{ attributes: { bold: true }, insert: "$$$BEHAVIORAL ISSUES?$$$\n\n" },
			{ insert: "Medical Issues:\n" },
			{ attributes: { bold: true }, insert: "$$$MEDICAL ISSUES?$$$\n\n" },
			{ insert: "Other Comments:\n" },
			{ attributes: { bold: true }, insert: "$$$OTHER COMMENTS?$$$\n\n" },
		],
	} as ReactQuill.Value
}

export function getCalendarAccessContent(): ReactQuill.Value {
	return {
		ops: [{ insert: "I need my calendar access restored to schedule an appointment." }],
	} as ReactQuill.Value
}

export function getPickUpMyDogContent(): ReactQuill.Value {
	return {
		ops: [
			{ insert: "I'm ready to pick up my dog and would like to schedule a time.\n\n" },
			{ insert: "My preferred dates/times are: " },
			{ attributes: { bold: true }, insert: "$$$PREFERRED DATES/TIMES$$$" },
		],
	} as ReactQuill.Value
}

export function getBlankContent(): ReactQuill.Value {
	return {
		ops: [{ insert: "" }],
	} as ReactQuill.Value
}

export function createQuickTexts(): QuickText[] {
	return [
		{
			label: AdopterInquiryTemplateLabel[AdopterInquiryTemplate.VISIT_MY_DOG],
			templateContent: getVisitMyDogContent(),
			value: AdopterInquiryTemplate.VISIT_MY_DOG,
		},
		{
			label: AdopterInquiryTemplateLabel[AdopterInquiryTemplate.SURRENDER_MY_DOG],
			templateContent: getSurrenderMyDogContent(),
			value: AdopterInquiryTemplate.SURRENDER_MY_DOG,
		},
		{
			label: AdopterInquiryTemplateLabel[AdopterInquiryTemplate.CALENDAR_ACCESS],
			templateContent: getCalendarAccessContent(),
			value: AdopterInquiryTemplate.CALENDAR_ACCESS,
		},
		{
			label: AdopterInquiryTemplateLabel[AdopterInquiryTemplate.PICK_UP_MY_DOG],
			templateContent: getPickUpMyDogContent(),
			value: AdopterInquiryTemplate.PICK_UP_MY_DOG,
		},
		{
			label: AdopterInquiryTemplateLabel[AdopterInquiryTemplate.BLANK],
			templateContent: getBlankContent(),
			value: AdopterInquiryTemplate.BLANK,
		},
	]
}
