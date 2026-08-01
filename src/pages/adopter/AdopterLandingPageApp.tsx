import { faChevronDown, faChevronUp, faShieldDog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import moment from "moment-timezone"
import { useCallback, useEffect, useState } from "react"
import ReactQuill from "react-quill"

import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AdopterPreferencesRequest } from "../../api/adopters/Requests"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import Logo from "../../assets/logo.png"
import ApprovalDiagram from "../../assets/Application-Approval-Diagram_v6.pdf"
import { AppointmentCard } from "../../cards/appointments/AppointmentCard"
import { AppointmentCardContext } from "../../cards/appointments/Types"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import { Toggleable } from "../../core/components/formInputs/CheckboxInput"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { AreYouSure } from "../../core/components/modal/AreYouSure"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import { MessageForm, QuickText } from "../../forms/users/MessageForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { AdopterPreferences } from "../../models/AdopterModels"
import { useScheduleState } from "../schedule/ScheduleAppState"
import { usePageTitle } from "../../utils/usePageTitle"

export function AdopterLandingPageApp() {
	usePageTitle("My Home")
	const session = useSessionState()
	const [prefs, setPrefs] = useState<AdopterPreferences>()

	useEffect(() => {
		if (session.user?.adopterID) {
			new AdoptersAPI().GetAdopterPreferences(session.user.adopterID).then((resp) => setPrefs(resp.pref))
		}
	}, [session.user?.adopterID])

	const currentAppt = session.user?.currentAppt
	const apptIsInPast = currentAppt?.isoInstant != null && moment(currentAppt.isoInstant).isBefore(moment())

	return (
		<FullWidthPage title={<WelcomeTitle />}>
			<div className="mx-5 mt-3 flex flex-col gap-y-1 border-t border-pink-800 py-2">
				{session.user?.restrictCalendar ? (
					<div className="flex flex-col gap-y-1">
						<PlaceholderText iconDef={faShieldDog} text={"Congratulations on your adoption!"} />
						<div className="text-lg">
							<div>Calendar access is restricted after choosing a dog or completing adoption.</div>
							<div>
								Use the <span className="font-bold text-pink-700">Message Adoptions</span> button for futher assistance, including any of the following:
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
				) : apptIsInPast ? (
					<div className="flex flex-col gap-y-1">
						<PlaceholderText iconDef={faShieldDog} text={"We're finishing up your appointment on our end!"} />
						<div className="text-lg">
							<div>
								Your appointment on <span className="font-semibold">{currentAppt!.instantDisplay}</span> is complete, but we still need to record the outcome.
								Your calendar access will be restored once that's done.
							</div>
							<div className="mt-1">Please check back later to reschedule.</div>
						</div>
						<MessageAdoptionsButton />
					</div>
				) : (
					<>
						<div className="flex flex-row flex-wrap gap-x-4">
							{currentAppt ? (
								<>
									<div className="text-lg">
										Your current appointment is <span className="font-semibold">{currentAppt.instantDisplay}.</span>
										<CancelAppointmentButton />
										<BookAppointmentButton />
										<MessageAdoptionsButton />
										<UpdatePreferencesButton />
									</div>
									<div className="m-auto flex w-sm flex-col gap-y-1">
										{currentAppt.ID && <AppointmentCard apptID={currentAppt.ID} context={AppointmentCardContext.CURRENT_APPOINTMENT} />}
									</div>
								</>
							) : (
								<div className="m-auto w-full text-lg">
									<span>You do not have an appointment booked.</span>
									<BringingDogFAQ prefs={prefs} onPrefsChange={setPrefs} />
									<ManageWatchlistButton />
									<BookAppointmentButton />
									<UpdatePreferencesButton />
									<MessageAdoptionsButton />
									<a
										className="m-auto mt-3 block w-fit rounded-lg border-2 border-gray-700 bg-gray-100 px-2 py-1 text-center uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none md:hidden"
										href={ApprovalDiagram}
										rel="noopener noreferrer"
										target="_blank"
									>
										View Adoption Process (PDF)
									</a>
									<iframe className="mt-3 hidden h-150 w-full md:block" src={ApprovalDiagram} title="Adoption Process" />
								</div>
							)}
						</div>
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
			<AreYouSure modalState={modalState} modalTitle={"Cancel Appointment"} youWantTo={"cancel your appointment"} onSubmit={handleSubmit} />
		</>
	)
}

function BringingDogFAQ({ prefs, onPrefsChange }: { prefs: AdopterPreferences | undefined; onPrefsChange: (updated: AdopterPreferences) => void }) {
	const session = useSessionState()
	const [open, setOpen] = useState(false)
	const [saving, setSaving] = useState(false)

	const referenceDate = moment()
	const month = referenceDate.month() + 1
	const isCoolWeather = month >= 11 || month <= 3

	const handleToggle = useCallback(
		async (newValue: boolean) => {
			if (!prefs || !session.user?.adopterID) return
			const { applicationComments: _, ...rest } = prefs
			const req: AdopterPreferencesRequest = { ...rest, adopterID: session.user.adopterID, bringingDog: newValue }
			setSaving(true)
			await new AdoptersAPI().UpdateAdopterPreferences(req)
			onPrefsChange({ ...prefs, bringingDog: newValue })
			setSaving(false)
			showToast({ level: MessageLevel.Success, message: "Saved!" })
		},
		[prefs, session.user?.adopterID, onPrefsChange]
	)

	return (
		<div className="m-auto my-1 w-full max-w-2xl text-base">
			<button
				className="flex w-full items-center justify-between rounded border border-pink-300 bg-pink-50 px-3 py-2 text-left font-semibold text-pink-800 hover:bg-pink-100"
				onClick={() => setOpen((o) => !o)}
			>
				<span className="m-auto">
					Bringing your current dog?
					{!open && prefs?.bringingDog && <span className="ml-2 text-sm font-normal text-green-700">{"✓ You've let us know — we'll be ready!"}</span>}
				</span>
				<FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
			</button>
			{open && (
				<div className="flex flex-col gap-y-2 rounded-b border border-t-0 border-pink-300 bg-white px-3 py-3 text-sm text-gray-700">
					<div className="text-left">
						<ul className="list-inside">
							<li className="list-disc!">
								<span className="font-semibold">Meet-and-greets happen on-leash in the parking lot.</span> Your dog does not go inside the gates.
							</li>
							<li className="list-disc!">
								{isCoolWeather
									? "Your dog can wait in the car while you visit."
									: "Your dog must wait in the parking lot with a family member while you visit."}
							</li>
						</ul>
					</div>
					<div className="m-auto">
						<Toggleable
							addlProps={{ disabled: saving }}
							fieldLabel="I'm planning to bring my current dog"
							value={prefs?.bringingDog ?? false}
							onChange={handleToggle}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

function UpdatePreferencesButton() {
	const handleClick = useCallback(async () => {
		window.location.href = "/preferences/"
	}, [])

	return (
		<>
			<LargeButton label="Update My Preferences" onClick={handleClick} />
			<p className="text-sm text-gray-500">
				Let us know your housing situation, dog size preferences, and other details that help us prepare for your visit.
			</p>
		</>
	)
}

function ManageWatchlistButton() {
	const handleClick = useCallback(async () => {
		window.location.href = "/watchlist/"
	}, [])

	return (
		<>
			<LargeButton label="Manage My Dog Watchlist" onClick={handleClick} />
			<p className="text-sm text-gray-500">
				Wondering if a specific dog will be at your appointment? Add them to your watchlist before booking — your appointment view will show which of your watchlisted
				dogs are expected to be available. You'll also be notified if a dog on your watchlist is adopted prior to your appointment.
			</p>
		</>
	)
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

	return (
		<>
			<LargeButton label="Book New Appointment" onClick={handleClick} />
			<p className="text-sm text-gray-500">Ready to pick a date and time? Browse available slots here.</p>
		</>
	)
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
			<p className="text-sm text-gray-500">Have a question for us? Our team typically responds within 24 hours during operating hours.</p>
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
