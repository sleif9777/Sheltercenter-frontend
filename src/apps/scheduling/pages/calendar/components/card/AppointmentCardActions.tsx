import { useStore } from "zustand"
import { AreYouSure } from "../../../../../../components/modals/AreYouSure"
import { Appointment, IAppointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { useSessionState } from "../../../../../../session/SessionState"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket, faArrowRightToBracket, faEnvelope, faEraser, faGhost, faLock, faPencil, faPrint, faTrash, faUnlock, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons"
import { CardActionButton } from "../../../../../../components/card/CardActionButton"
import { AdopterBookingForm } from "../../forms/booking/AdopterBookingForm"
import { CheckOutForm } from "../../forms/booking/CheckOutForm"
import moment from "moment"
import { CheckInForm } from "../../forms/booking/CheckInForm"
import { StandardCardActions } from "../../../../../../components/card/Card"
import { MessagingModal } from "../../../../../messaging/MessagingModal"
import { AppointmentCardQuickTexts } from "./QuickTexts"
import { AdopterAPI } from "../../../../../adopters/api/API"
import { AppointmentCardContext } from "./AppointmentCard"
import { AppointmentType } from "../../../../enums/Enums"

export function AppointmentCardActions(forAppt: IAppointment, context: AppointmentCardContext): StandardCardActions {
    const appointment = new Appointment(forAppt), booking = appointment.getCurrentBooking()
    const session = useStore(useSessionState), schedule = useStore(useSchedulingHomeState)
    const d = new Date()
    d.setHours(0, 0, 0, 0) // Midnight today

    // MESSAGING BUTTON
    function messageButton() {
        if (booking && session.adminUser) {
            return <MessagingModal 
                recipient={booking.adopter} 
                subject={`A message about your upcoming appointment: ${booking.adopter.fullName.toLocaleUpperCase()}`} 
                extendOnSubmit={async (message, subject) => {
                    await new AdopterAPI().MessageAdopter({
                        adopterID: booking.adopter.ID,
                        message: message,
                        subject: subject
                    })
                }} 
                quickTexts={AppointmentCardQuickTexts(booking)} 
                buttonClass={`message-appt-${appointment.id}`}
                buttonId={`message-appt-${appointment.id}`}
                launchBtnLabel={<FontAwesomeIcon icon={faEnvelope} />} 
                modalTitle={"Send Message"}  
                tooltipText="Send Message"
            />
        }

        return <></>
    }

    // DELETE BUTTON
    function deleteButton() {
        if (session.adminUser && !booking) {
            return <AreYouSure 
                extendOnSubmit={async () => {
                    if (!appointment.id) {
                        return
                    }

                    await new AppointmentsAPI().SoftDeleteAppointment(appointment.id) 
                    schedule.refresh(schedule.viewDate, [], session.userID!)
                }}
                youWantTo="delete this appointment"
                submitBtnLabel={"Delete"}
                buttonClass={`delete-appt-${appointment.id}`}
                buttonId={`delete-appt-${appointment.id}`}
                launchBtnLabel={<FontAwesomeIcon icon={faTrash} />}
                cancelBtnLabel="Go Back"
                modalTitle="Delete Appointment"
                tooltipText="Delete"
            />
        }

        return <></>
    }

    // GHOST BUTTON
    function ghostButton() {
        if (booking && !session.adopterUser) {
            return <AreYouSure 
                extendOnSubmit={async () => {
                    await new AppointmentsAPI().MarkNoShow(appointment.id) 
                    schedule.refresh(schedule.viewDate, [], session.userID!)
                }}
                youWantTo="mark this appointment as a no-show"
                submitBtnLabel={"Yes"}
                buttonClass={`ghost-appt-${appointment.id}`}
                buttonId={`ghost-appt-${appointment.id}`}
                launchBtnLabel={<FontAwesomeIcon icon={faGhost} />}
                cancelBtnLabel="Go Back"
                modalTitle="No Show"
                tooltipText="No Show"
            />
        }

        return <></>
    }

    // PRINT BUTTON
    function printButton() {
        if (booking && 
                !session.adopterUser &&
                booking.adopter.shelterluvAppID) {
            const href = `https://new.shelterluv.com/application-request/${booking?.adopter.shelterluvAppID}/print`

            return <CardActionButton 
                icon={faPrint} 
                id={"print-appt-" + appointment.id} 
                extendOnClick={() => window.open(href, "_blank")} 
                tooltipContent={"Print Application"} 
                tooltipId={"print-appt-" + appointment.id + "-ttp"}    
            />
        }

        return <></>
    }

    // CANCEL BUTTON
    function cancelButton() {
        if (booking && session.adminUser && !appointment.checkOutTime) {
            return <AreYouSure 
                extendOnSubmit={async () => {
                    await new AppointmentsAPI().CancelAppointment(appointment.id) 

                    if (context === "Adopter Detail") {
                        window.location.reload()
                    } else {
                        schedule.refresh(schedule.viewDate, [], session.userID!)
                    }
                }}
                youWantTo="cancel this appointment"
                submitBtnLabel={"Cancel"}
                buttonClass={`cancel-appt-${appointment.id}`}
                buttonId={`cancel-appt-${appointment.id}`}
                launchBtnLabel={<FontAwesomeIcon icon={faEraser} />}
                cancelBtnLabel="Go Back"
                modalTitle="Cancel Appointment"
                tooltipText="Cancel"
            />
        }

        return <></>
    }

    // LOCK BUTTON
    function lockButton() {
        if (session.adminUser && !appointment.checkOutTime) {
            return <CardActionButton 
                extendOnClick={async () => {
                    await new AppointmentsAPI().ToggleLock(appointment.id)
                    schedule.refresh(schedule.viewDate, [], session.userID!)
                }}
                icon={appointment.locked ? faUnlock : faLock}
                id={`lock-appt-${appointment.id}`}
                tooltipContent={appointment.locked ? "Unlock" : "Lock"}
                tooltipId={`lock-appt-${appointment.id}-ttp`}
            />
        }

        return <></>
    }

    // BOOKING FORM
    function bookingForm() {
        if (session.adminUser || 
                (session.greeterUser && !appointment.getCurrentBooking()) ||
                session.adopterUser && session.userID == booking?.adopter.userID) {
            return <AdopterBookingForm 
                appointment={appointment} 
                launchBtnLabel={<FontAwesomeIcon icon={booking ? faPencil : faWandMagicSparkles} />} 
            />
        }

        return <></>
    }

    // CHECK OUT
    function checkOutForm() {
        if (!session.adopterUser) {
            return <CheckOutForm 
                appointment={appointment} 
                btnClass="grey-card-link"
                launchBtnLabel={<FontAwesomeIcon icon={appointment.checkOutTime ? faPencil : faArrowRightFromBracket} />} 
            />
        }

        return <></>
    }

    // CHECK IN
    function checkInForm() {
        if (!session.adopterUser &&
                !appointment.checkInTime) {
            return <CheckInForm 
                appointment={appointment} 
                launchBtnLabel={<FontAwesomeIcon icon={faArrowRightToBracket} />} 
            />
        }

        return <></>
    }

    // NO ACTIONS IF NO SHOW OR IN THE PAST
    if (appointment.outcome == 4 || moment(appointment.instant).isBefore(moment(d))) {
        return []
    }

    if ([AppointmentType.SURRENDER, AppointmentType.VISIT].includes(appointment.type)) {
        return [deleteButton()]
    }

    // ONLY CHECKOUT FORM IF CHECKED OUT
    if (appointment.checkOutTime) {
        return [messageButton(), checkOutForm()].reverse()
    }

    if (context == "Adopter Detail") {
        return [
            messageButton(),
            printButton(),
            bookingForm(),
            cancelButton(),
        ].reverse()
    }

    return [
        messageButton(),
        ghostButton(),
        checkInForm(),
        checkOutForm(),
        printButton(),
        bookingForm(),
        lockButton(),
        cancelButton(),
        deleteButton()
    ].reverse()
}