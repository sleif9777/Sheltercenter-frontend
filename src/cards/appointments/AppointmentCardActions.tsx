import {
	faEdit,
	faEnvelope,
	faGhost,
	faLock,
	faPencil,
	faPrint,
	faSignInAlt,
	faSignOutAlt,
	faTrash,
	faUnlock,
	faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons"
import { useCallback } from "react"

import { CardActionAreYouSure } from "../../core/components/card/CardActionAreYouSure"
import { CardActionButton } from "../../core/components/card/CardActionButton"
import { CardActionSection } from "../../core/components/card/CardActionSection"
import { CardColor } from "../../core/components/card/CardEnums"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import { Outcome } from "../../enums/AppointmentEnums"
import { isAdoptionAppointment } from "../../forms/appointments/AppointmentForm"
import { CheckInForm } from "../../forms/appointments/CheckInForm"
import { CheckOutForm } from "../../forms/appointments/CheckOutForm"
import { BookingForm } from "../../forms/bookings/BookingForm"
import { MessageForm } from "../../forms/users/MessageForm"
import { IAppointment } from "../../models/AppointmentModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { AppointmentCardActionProps, AppointmentCardContext } from "./Types"
import { getCanViewBookingForm, unpackApptData } from "./Utils"

export function AppointmentCardActions({
	appt,
	context,
	session,
}: {
	context: AppointmentCardContext
} & AppointmentCardActionProps) {
	const actionProps = {
		appt: appt,
		session: session,
	}

	if (session.adopterUser) {
		return context == AppointmentCardContext.TIMESLOT && <AdopterBookButton appt={appt} />
	}

	return (
		<CardActionSection color={CardColor.GRAY}>
			{appt.checkOutTime ? (
				<>
					<PrintButton {...actionProps} />
					<MessageButton {...actionProps} />
					<CheckOutButton {...actionProps} />
				</>
			) : (
				<>
					{isAdoptionAppointment(appt.type) &&
						(appt.checkOutTime ? (
							<></>
						) : (
							<>
								<PrintButton {...actionProps} />
								<BookingFormButton {...actionProps} />
								<MessageButton {...actionProps} />
								{context == AppointmentCardContext.TIMESLOT && (
									<>
										<CheckInButton {...actionProps} />
										<CheckOutButton {...actionProps} />
										<GhostButton {...actionProps} />
										<LockButton {...actionProps} />
									</>
								)}
							</>
						))}
					{appt.hasCurrentBooking ? <CancelButton {...actionProps} /> : <DeleteButton {...actionProps} />}
				</>
			)}
		</CardActionSection>
	)
}

function MessageButton({ appt }: AppointmentCardActionProps) {
	const modalState = useModalState()

	if (!appt.hasCurrentBooking) {
		return
	}

	return (
		<>
			<CardActionButton
				primaryIcon={faEnvelope}
				primaryTooltipContent={"Message " + appt.booking?.adopter.demographics.firstName}
				onClick={modalState.open}
			/>
			<Modal modalState={modalState} modalTitle={"Message " + appt.booking?.adopter.demographics.firstName}>
				<MessageForm
					adopterID={appt.booking?.adopter.demographics.ID ?? 0}
					apptID={appt.ID}
					hideSubject
					modalState={modalState}
				/>
			</Modal>
		</>
	)
}

function DeleteButton({ appt }: AppointmentCardActionProps) {
	const apptID = appt.ID
	const schedule = useScheduleState()
	const session = useSessionState()

	const handleDelete = useCallback(async () => {
		if (!appt.ID) {
			return
		}

		await new AppointmentsAPI().SoftDeleteAppointment(apptID)
		schedule.refresh()
	}, [appt.ID, apptID, schedule])

	if (appt.hasCurrentBooking || !session.adminUser) {
		return
	}

	return (
		<CardActionAreYouSure
			icon={faTrash}
			modalTitle="Delete Appointment"
			youWantTo="delete this appointment"
			onSubmit={handleDelete}
		/>
	)
}

function CancelButton({ appt }: AppointmentCardActionProps) {
	const apptID = appt.ID
	const schedule = useScheduleState()
	const session = useSessionState()

	const handleCancel = useCallback(async () => {
		if (!appt.ID) {
			return
		}

		await new AppointmentsAPI().CancelAppointment(apptID)
		schedule.refresh()
	}, [apptID, appt.ID, schedule])

	const isUsersCurrentAppt = session.user?.currentAppt?.ID === apptID

	if (!appt.hasCurrentBooking || !(isUsersCurrentAppt || session.adminUser) || appt.checkInTime || appt.outcome) {
		return
	}

	return (
		<CardActionAreYouSure
			icon={faTrash}
			modalTitle="Cancel Appointment"
			youWantTo="cancel this appointment"
			onSubmit={handleCancel}
		/>
	)
}

function GhostButton({ appt }: AppointmentCardActionProps) {
	const apptID = appt.ID
	const schedule = useScheduleState()

	const handleGhost = useCallback(async () => {
		await new AppointmentsAPI().MarkNoShow(apptID)
		schedule.refresh(schedule.isoDate)
	}, [apptID, schedule])

	// TODO: Security
	if (!appt.hasCurrentBooking || appt.checkInTime || appt.outcome) {
		return
	}

	return (
		<CardActionAreYouSure
			icon={faGhost}
			modalTitle="No Show"
			youWantTo="mark this appointment as a no-show"
			onSubmit={handleGhost}
		/>
	)
}

function CheckInButton({ appt }: AppointmentCardActionProps) {
	const apptID = appt.ID,
		{ adopter } = unpackApptData(appt)
	const modalState = useModalState()

	if (!appt.hasCurrentBooking || (appt.outcome && appt.outcome != Outcome.NO_SHOW)) {
		return
	}

	return (
		<>
			<Modal modalState={modalState} modalTitle="Check In">
				<CheckInForm
					apptID={apptID}
					defaultValues={{
						city: adopter?.demographics.city,
						clothingDescription: appt.clothingDescription,
						counselor: appt.counselor,
						postalCode: adopter?.demographics.postalCode,
						state: adopter?.demographics.state,
						streetAddress: adopter?.demographics.streetAddress,
					}}
					modalState={modalState}
				/>
			</Modal>
			<CardActionButton
				primaryIcon={appt.checkInTime ? faPencil : faSignInAlt}
				primaryTooltipContent={appt.checkInTime ? "Edit Check-In Details" : "Check In"}
				onClick={modalState.open}
			/>
		</>
	)
}

function CheckOutButton({ appt }: AppointmentCardActionProps) {
	const apptID = appt.ID
	const modalState = useModalState()

	if (!appt.booking) {
		return
	}

	return (
		<>
			<Modal modalState={modalState} modalTitle="Check Out">
				<CheckOutForm apptID={apptID} defaults={{ dog: appt.chosenDog, outcome: appt.outcome }} modalState={modalState} />
			</Modal>
			<CardActionButton
				primaryIcon={appt.checkOutTime ? faEdit : faSignOutAlt}
				primaryTooltipContent="Check Out"
				onClick={modalState.open}
			/>
		</>
	)
}

function PrintButton({ appt }: AppointmentCardActionProps) {
	const booking = appt.booking

	if (!booking?.adopter?.demographics.shelterluvAppID) {
		return
	}

	const link = `https://new.shelterluv.com/application-request/${booking.adopter.demographics.shelterluvAppID}/print`

	return (
		<CardActionButton
			primaryIcon={faPrint}
			primaryTooltipContent="Print Application"
			onClick={() => window.open(link, "_blank")}
		/>
	)
}

function LockButton({ appt, session }: AppointmentCardActionProps) {
	const isLocked = appt.locked
	const schedule = useScheduleState()

	const handleClick = useCallback(async () => {
		await new AppointmentsAPI().ToggleLockForSingleAppt(appt.ID, isLocked)
		schedule.refresh()
	}, [appt.ID, isLocked, schedule])

	if (!session.adminUser || appt.checkInTime || appt.outcome) {
		return
	}

	return (
		<CardActionButton
			primaryIcon={appt.locked ? faUnlock : faLock}
			primaryTooltipContent={appt.locked ? "Unlock" : "Lock"}
			onClick={handleClick}
		/>
	)
}

export function AdopterBookButton({ appt }: { appt: IAppointment }) {
	const session = useSessionState()
	const modalState = useModalState()
	const schedule = useScheduleState()

	const handleBookClick = useCallback(async () => {
		if (!session.user?.adopterID) {
			return
		}

		await new AppointmentsAPI().ScheduleAppointment({
			adopterID: session.user.adopterID ?? 0,
			apptID: appt.ID,
		})

		session.setCurrentAppt(appt)
		schedule.refresh()
	}, [appt, schedule, session])

	if (!session.user?.adopterID || session.user.currentAppt) {
		return
	}

	if (appt.locked) {
		return (
			<>
				<button
					className="cursor-pointer rounded-md bg-pink-700 px-3 py-1 text-sm font-medium text-white hover:bg-pink-400"
					onClick={modalState.open}
				>
					Message Us
				</button>
				<Modal modalState={modalState} modalTitle="Message Adoptions">
					<MessageForm
						adopterID={session.user?.adopterID}
						hideSubject
						initialValue={"I would like to book the locked appointment on " + appt.instantDisplay + "."}
						isMessageToAdoptions
						modalState={modalState}
					/>
				</Modal>
			</>
		)
	}

	return (
		<button
			className="cursor-pointer rounded-md bg-pink-700 px-3 py-1 text-sm font-medium text-white hover:bg-pink-400"
			onClick={handleBookClick}
		>
			Click to Book
		</button>
	)
}

function BookingFormButton({ appt, session }: AppointmentCardActionProps) {
	const modalState = useModalState()

	if (!getCanViewBookingForm(appt, session) || appt.outcome) {
		return
	}

	return (
		<>
			<CardActionButton
				primaryIcon={appt.hasCurrentBooking ? faEdit : faWandMagicSparkles}
				primaryTooltipContent={appt.hasCurrentBooking ? "Edit Appointment" : "Book Appointment"}
				onClick={modalState.open}
			/>
			<Modal modalState={modalState} modalTitle="Book Appointment">
				<BookingForm apptData={appt} modalState={modalState} session={session} />
			</Modal>
		</>
	)
}
