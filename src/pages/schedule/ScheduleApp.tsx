import {
	faAnglesLeft,
	faAnglesRight,
	faCalendar,
	faPencil,
	faPerson,
	faShieldDog,
	faShopLock,
	faSpinner,
	faTrash,
	faTurnDown,
	faWandMagicSparkles,
	IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"

import { AppointmentCard } from "../../cards/appointments/AppointmentCard"
import { AppointmentCardContext } from "../../cards/appointments/Types"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { AreYouSure } from "../../core/components/modal/AreYouSure"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import { AppointmentForm } from "../../forms/appointments/AppointmentForm"
import { CheckOutForm } from "../../forms/appointments/CheckOutForm"
import { JumpToDateForm } from "../../forms/appointments/JumpToDateForm"
import { WalkInForm } from "../../forms/appointments/WalkInForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { ToolbarAreYouSure, ToolbarButton, ToolbarLink, ToolbarModal } from "../../layouts/Toolbar/Toolbar"
import { AdopterAlert } from "../../models/AdopterModels"
import { AppointmentHash, AppointmentMissingOutcome, HashAppointment } from "../../models/AppointmentModels"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AdopterAlertsResponse } from "../../api/adopters/Responses"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { AppointmentsMissingOutcomesResponse, EmptyDatesResponse } from "../../api/appointments/Responses"
import { ClosedDatesAPI } from "../../api/closedDates/ClosedDatesAPI"
import { DateTime } from "../../utils/DateTime"
import { CancelAppointmentButton } from "../adopter/AdopterLandingPageApp"
import { ErrorApp } from "../error/ErrorApp"
import { useScheduleState } from "./ScheduleAppState"

export function ScheduleApp() {
	const schedule = useScheduleState()
	const session = useSessionState()

	// Render the component
	useEffect(() => {
		schedule.refresh(new DateTime().GetISODate())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FullWidthPage
			subtitle={schedule.dateUtil.GetWeekdayStr()}
			title={<ScheduleAppTitle />}
			toolbarItems={[
				<ReturnToTodayButton key={0} />,
				<JumpToDateModal key={1} />,
				...(!session.adopterUser
					? [
							<DailyReportButton key={2} />,
							<PrintViewButton key={3} />,
							<LockToggleButton key={4} />,
							<LockToggleButton isUnlock key={5} />,
							<CancelAndCloseButton key={6} />,
						]
					: [<HelpModal key={2} />]),
			]}
		>
			<AlertsSection />
			{session.adopterUser && <CancelAppointmentButton />}
			<CalendarContent />
		</FullWidthPage>
	)
}

function UserInstructions() {
	// TODO: redo this once the adopter UI is more finalized, so we can give more specific instructions for the current state of the UI and appointment types
	return (
		<div>
			<b style={{ fontSize: "large", textDecoration: "underline" }}>Using the Scheduler</b>
			<ul>
				<li>The scheduler works best on desktops and laptops.</li>
				<li>
					Click the <FontAwesomeIcon icon={faWandMagicSparkles} /> magic wand icon to open the booking form.
				</li>
				<li>Fill the booking form out and press Accept to confirm.</li>
				<li>
					Click the <FontAwesomeIcon icon={faPencil} /> trash can icon to edit your appointment.
				</li>
				<li>
					Click the <FontAwesomeIcon icon={faTrash} /> trash can icon to cancel your appointment.
				</li>
			</ul>
			<b style={{ fontSize: "large", textDecoration: "underline" }}>Appointment Types</b>
			<ul>
				<li>
					<b>"Fun Size"</b> appointments are for specific <u>adult</u> dogs under 20 lbs living in foster homes (
					<a href="https://savinggracenc.org/adopt/meet-our-dogs/" target="_blank">
						noted on their profile
					</a>
					). These dogs are available to meet Fridays and Saturdays.
				</li>
				<li>
					<b>"Puppies"</b> appointments are for all available puppies (regardless of size).
				</li>
				<li>
					<b>"All Ages"</b> appointments are for all available puppies and adults above 20 pounds not listed as "by
					appointment only".
				</li>
			</ul>
			<b style={{ fontSize: "large", textDecoration: "underline" }}>Interested in a specific dog?</b>
			<p>
				If interested in a specific dog,{" "}
				<a href="https://savinggracenc.org/adopt/meet-our-dogs/" target="_blank">
					check for an arrival date on their profile
				</a>
				. If listed, book as early as possible on their arrival date or after and mention that dog in the appointment notes.
				If no listed date, the dog is available to meet at any time.
			</p>
		</div>
	)
}

////// TOOLBAR COMPONENTS //////
function ReturnToTodayButton() {
	const schedule = useScheduleState()
	const handleClick = async () => {
		schedule.refresh(new DateTime().GetISODate())
	}

	return <ToolbarButton text="Return to Today" onClick={() => handleClick()} />
}

function JumpToDateModal() {
	const modalState = useModalState()

	return (
		<ToolbarModal
			modal={
				<Modal modalState={modalState} modalTitle="Jump to Date">
					<JumpToDateForm modalState={modalState} />
				</Modal>
			}
			text="Jump to Date"
		/>
	)
}

function DailyReportButton() {
	const schedule = useScheduleState()

	return <ToolbarLink href={"/daily_report/" + schedule.dateUtil.GetISODate()} text="Daily Report" />
}

function PrintViewButton() {
	const schedule = useScheduleState()

	return <ToolbarLink href={"/print_view/" + schedule.dateUtil.GetISODate()} text="Print View" />
}

function LockToggleButton({ isUnlock }: { isUnlock?: boolean }) {
	const schedule = useScheduleState(),
		session = useSessionState()
	const titleAttr = isUnlock ? "Unlock" : "Lock",
		lowerAttr = titleAttr.toLowerCase()
	const handleClick = useCallback(async () => {
		await new AppointmentsAPI().ToggleLockForDate(schedule.isoDate, isUnlock ?? false)
		schedule.refresh()
	}, [isUnlock, schedule])

	const modalState = useModalState()

	if (!session.adminUser) {
		return
	}

	return (
		<>
			<ToolbarButton text={titleAttr + " All"} onClick={modalState.open} />
			<AreYouSure
				modalState={modalState}
				modalTitle={`${titleAttr} All Appointments`}
				youWantTo={`${lowerAttr} all appointments for this date`}
				onSubmit={handleClick}
			/>
		</>
	)
}

function HelpModal() {
	const session = useSessionState(),
		modalState = useModalState()

	if (!session.adopterUser) {
		return
	}

	return (
		<ToolbarModal
			modal={
				<Modal modalState={modalState} modalTitle="Help">
					<UserInstructions />
				</Modal>
			}
			text="Help"
		/>
	)
}

function CancelAndCloseButton() {
	const session = useSessionState(),
		schedule = useScheduleState(),
		modalState = useModalState()

	const handleSubmit = useCallback(async () => {
		await new AppointmentsAPI().CancelAllAndClose(schedule.isoDate)
		schedule.refresh()
	}, [schedule])

	if (!session.adminUser) {
		return
	}

	return (
		<ToolbarAreYouSure
			areYouSure={
				<AreYouSure
					modalState={modalState}
					modalTitle="Help"
					youWantTo="cancel all appointments for this date and close"
					onSubmit={handleSubmit}
				/>
			}
			text="Cancel and Close"
		/>
	)
}

function CopyFromTemplateButton() {
	const schedule = useScheduleState()

	const handleClick = useCallback(async () => {
		await new AppointmentsAPI().CreateBatchForDate(schedule.isoDate)
		schedule.refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [schedule.refresh, schedule.isoDate])

	return <LargeButton label={`Copy from ${schedule.dateUtil.GetWeekdayStr()} Template`} onClick={handleClick} />
}

function MarkAsClosedDateButton() {
	const schedule = useScheduleState()

	const handleClick = useCallback(async () => {
		await new ClosedDatesAPI().MarkDateAsClosed(schedule.isoDate)
		schedule.refresh()
	}, [schedule])

	return <LargeButton label="Mark Date as Closed" onClick={handleClick} />
}

function UndoMarkClosedButton() {
	const schedule = useScheduleState(),
		session = useSessionState()

	const handleClick = useCallback(async () => {
		await new ClosedDatesAPI().UndoMarkDateAsClosed(schedule.isoDate)
		schedule.refresh()
	}, [schedule])

	if (!schedule.isClosedDate || !session.adminUser) {
		return
	}

	return <LargeButton label="Undo Closed Date" onClick={handleClick} />
}

function CalendarContent() {
	const schedule = useScheduleState(),
		session = useSessionState()

	if (session.user?.restrictCalendar) {
		return <RestrictCalendarPlaceholder />
	}

	if (schedule.dateUtil.IsSunday()) {
		return <PlaceholderText iconDef={faShopLock} text="Sundays are closed by default." />
	}

	if (schedule.isClosedDate) {
		return (
			<>
				<PlaceholderText iconDef={faShopLock} text="Saving Grace will be closed on this date." />
				<UndoMarkClosedButton />
			</>
		)
	}

	if (session.adopterUser) {
		if (schedule.isUnschedulable()) {
			return <PlaceholderText iconDef={faShieldDog} text="Appointments will be open for booking two weeks in advance." />
		}

		if (schedule.isPast()) {
			return <PlaceholderText iconDef={faShieldDog} text="This date is now closed." />
		}
	}

	if (schedule.loadingAppointments) {
		return <PlaceholderText iconDef={faSpinner} text="Loading appointments..." />
	}

	if (schedule.contextLoadFailed) {
		return <ErrorApp errorObj={schedule.failedLoadResp!} scheduleDate={schedule.dateUtil} />
	}

	if (!schedule.apptHash) {
		if (session.adminUser) {
			return (
				<>
					<AppointmentFormModal />
					<CopyFromTemplateButton />
					<MarkAsClosedDateButton />
				</>
			)
		} else {
			return <PlaceholderText iconDef={faShieldDog} text={"No appointments published for this date."} />
		}
	}

	if (!schedule.hasAvailableAppts && session.adopterUser && !schedule.isUserCurrentApptDate()) {
		return <PlaceholderText iconDef={faShieldDog} text={"All appointments on this date are booked."} />
	}

	return (
		<div className="flex flex-col gap-y-1">
			<div className="m-auto flex max-w-fit flex-row gap-x-4">
				<AppointmentFormModal />
				<WalkInFormModal />
			</div>
			{schedule.apptHash
				.sort((a, b) => a.key - b.key)
				.map((hash) => (
					<ScheduleTimeslot hash={hash} key={hash.key} />
				))}
		</div>
	)
}

function AppointmentFormModal() {
	const session = useSessionState(),
		modalState = useModalState()

	if (!session.adminUser) {
		return
	}

	return (
		<>
			<LargeButton label="Add Appointment" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle="Add Appointment">
				<AppointmentForm modalState={modalState} />
			</Modal>
		</>
	)
}

function WalkInFormModal() {
	const session = useSessionState(),
		modalState = useModalState()

	if (session.adopterUser) {
		return
	}

	return (
		<>
			<LargeButton label="Add Walk-In" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle="Add Walk-In">
				<WalkInForm modalState={modalState} />
			</Modal>
		</>
	)
}

function ScheduleTimeslot({ hash }: { hash: AppointmentHash }) {
	const session = useSessionState()

	// Filter appointments based on user type
	const filteredAppointments: HashAppointment[] = session.adopterUser
		? hash.value.filter((appt: HashAppointment) => !appt.isAdminAppt)
		: hash.value // Admin users see everything

	const hasOpenAppt = filteredAppointments.some((appt) => !appt.hasCurrentBooking)

	// Don't render the timeslot if no appointments after filtering
	if (filteredAppointments.length === 0) {
		return null
	}

	return (
		<div className="pb-4" id={"timeslot-" + hash.key}>
			<div className="pb-1 pl-2 text-left text-2xl">
				{hash.label} {!hasOpenAppt && session.adopterUser && <>- FULLY BOOKED</>}
			</div>
			<ul className="columns-1 sm:columns-2">
				{filteredAppointments.map((appt, i) => (
					<AppointmentCard apptID={appt.ID} context={AppointmentCardContext.TIMESLOT} key={i} />
				))}
			</ul>
		</div>
	)
}

////// PAGE TITLE //////
type IncrementOrDecrementOne = 1 | -1

export function ScheduleAppTitle() {
	const schedule = useScheduleState()

	return (
		<>
			<ChangeScheduleDateButton icon={faAnglesLeft} step={-1} />
			<span>{schedule.dateUtil.GetShortDate()}</span>
			<ChangeScheduleDateButton icon={faAnglesRight} step={1} />
		</>
	)
}

function ChangeScheduleDateButton({ step, icon }: { step: IncrementOrDecrementOne; icon: IconDefinition }) {
	const schedule = useScheduleState()
	const handleClick = useCallback(
		(step: IncrementOrDecrementOne) => {
			const newISODate = schedule.dateUtil.GetDiffedDate(step)
			schedule.refresh(newISODate)
		},
		[schedule]
	)
	const tooltip = step == 1 ? "Next Date" : "Previous Date"

	return (
		<TooltipProvider tooltip={tooltip}>
			<button
				className={`hover:cursor-pointer hover:text-pink-700 ${step == 1 ? "pl-5" : "pr-5"}`}
				onClick={() => handleClick(step)}
			>
				<FontAwesomeIcon icon={icon} />
			</button>
		</TooltipProvider>
	)
}

function RestrictCalendarPlaceholder() {
	return (
		<>
			<PlaceholderText iconDef={faShieldDog} text={"Congrats on your adoption!"} />
			<p>
				Calendar access is restricted after choosing a dog. Email adoptions@savinggracenc.org for futher assistance,
				including any of the following:
			</p>
			<ul>
				{/* TODO: Make these messaging modals */}
				<li>I have not actually choosen a dog.</li>
				<li>I want to change my decision.</li>
				<li>My dog is not ready to go home, and I want to visit.</li>
				<li>My dog is ready to go home, and I need arrange up a pickup time.</li>
				<li>I need to surrender my adopted or foster-to-adopt dog.</li>
				<li>I want to begin a new adoption.</li>
			</ul>
		</>
	)
}

// ALERT CARDS
function AlertsSection() {
	const schedule = useScheduleState(),
		session = useSessionState()

	if (schedule.contextLoadFailed) {
		return
	}

	if (session.adminUser) {
		return (
			<div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
				<EmptyDatesAlertCard />
				<JumpToTimeslots />
				<MissingOutcomesAlertCard />
				<AdopterAlertCard />
			</div>
		)
	}
}

function EmptyDatesAlertCard() {
	const schedule = useScheduleState()
	const [emptyDates, setEmptyDates] = useState<DateTime[]>([])

	const fetchData = useCallback(async () => {
		const resp: EmptyDatesResponse = await new AppointmentsAPI().GetEmptyDates()
		setEmptyDates(resp.emptyDates.map((isoDate) => new DateTime(isoDate)).filter((dt) => !dt.IsSunday()))
	}, [])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	return (
		<StandardCard color={CardColor.RED} description="Empty Dates" maxWidth="max-w-xs" topIcon={faCalendar}>
			<div className="px-1 text-left">
				<b>Publish appointments or mark closed:</b>
				<ul className="columns-2">
					{emptyDates.map((dt, i) => (
						<li key={i}>
							<span className="hover:cursor-pointer hover:bg-red-400" onClick={() => schedule.refresh(dt.GetISODate())}>
								{dt.GetShortDate(true)}
							</span>
						</li>
					))}
				</ul>
			</div>
		</StandardCard>
	)
}

export function JumpToTimeslots() {
	const schedule = useScheduleState()

	if (!schedule.apptHash || schedule.apptHash?.length == 0 || schedule.isPast() || schedule.isPastCloseTime()) {
		return
	}

	return (
		<StandardCard color={CardColor.BLUE} description="Jump to Timeslot" topIcon={faTurnDown}>
			<div className="px-1 text-left">
				<ul className="columns-3">
					{schedule.apptHash?.map((hash, i) => (
						<li key={i}>
							<a className="hover:cursor-pointer hover:bg-blue-400 hover:text-white" href={"#timeslot-" + hash.key}>
								{hash.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</StandardCard>
	)
}

function MissingOutcomesAlertCard() {
	const [appts, setAppts] = useState<AppointmentMissingOutcome[]>([])

	const fetchData = useCallback(async () => {
		const resp: AppointmentsMissingOutcomesResponse = await new AppointmentsAPI().GetAppointmentsMissingOutcomes()
		setAppts(resp.appts)
	}, [])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	if (appts.length == 0) {
		return
	}

	return (
		<StandardCard color={CardColor.RED} description="Missing Outcomes" maxWidth="max-w-xs" topIcon={faCalendar}>
			<div className="px-1 pb-1 text-left">
				<b>Finalize outcomes for:</b>
				<ul>
					{appts.map((appt, i) => {
						return (
							<li key={i}>
								<MissingOutcome appt={appt} />
							</li>
						)
					})}
				</ul>
			</div>
		</StandardCard>
	)
}

function MissingOutcome({ appt }: { appt: AppointmentMissingOutcome }) {
	const modalState = useModalState()

	return (
		<>
			<Modal modalState={modalState} modalTitle="Finalize Outcome">
				<CheckOutForm apptID={appt.ID} modalState={modalState} />
			</Modal>
			<button className="cursor-pointer rounded-md hover:bg-red-400" onClick={modalState.open}>
				{appt.description} - {new DateTime(appt.isoDate).GetShortDate()}
			</button>
		</>
	)
}

function AdopterAlertCard() {
	const schedule = useScheduleState()
	const [alerts, setAlerts] = useState<AdopterAlert[]>([])

	const fetchData = useCallback(async () => {
		const resp: AdopterAlertsResponse = await new AdoptersAPI().GetAdopterAlerts(schedule.isoDate)
		setAlerts(resp.alerts)
	}, [schedule.isoDate])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	if (alerts.length < 1) {
		return
	}

	return (
		<StandardCard color={CardColor.PURPLE} description="Adopter Alerts" maxWidth="max-w-xs" topIcon={faPerson}>
			<div className="px-1 text-left">
				<ul>
					{alerts.map((alert, i) => (
						<li key={i}>
							<b>{alert.name}</b> - {alert.alerts}
						</li>
					))}
				</ul>
			</div>
		</StandardCard>
	)
}
