import { faArrowRightFromBracket, faArrowRightToBracket, faEnvelope, faGhost, faLock, faPencil, faPrint, faTrash, faUnlock, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import moment from "moment"
import { useStore } from "zustand"

import { StandardCardActions } from "../../../../../../components/card/Card"
import { CardActionButton } from "../../../../../../components/card/CardActionButton"
import { AreYouSure } from "../../../../../../components/modals/AreYouSure"
import { useSessionState } from "../../../../../../session/SessionState"
import { AdopterAPI } from "../../../../../adopters/api/API"
import { MessagingModal } from "../../../../../messaging/MessagingModal"
import { AppointmentType } from "../../../../enums/Enums"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { AdopterBookingForm } from "../../forms/booking/AdopterBookingForm"
import { CheckInForm } from "../../forms/booking/CheckInForm"
import { CheckOutForm } from "../../forms/booking/CheckOutForm"
import { Appointment, IAppointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import { AppointmentCardContext } from "./AppointmentCard"
import { AppointmentCardQuickTexts } from "./QuickTexts"

export function AppointmentCardActions(forAppt: IAppointment, context: AppointmentCardContext): StandardCardActions {
    const appointment = new Appointment(forAppt), booking = appointment.getCurrentBooking()
    const session = useStore(useSessionState), schedule = useStore(useSchedulingHomeState)
    const d = new Date()
    d.setHours(0, 0, 0, 0) // Midnight today

    // MESSAGING BUTTON
    function messageButton() {
        if (booking && session.adminUser) {
            const signature = (session.userFName && session.userLName)
                ? `${session.userFName} ${session.userLName}`
                : "The Adoptions Team"

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
                quickTexts={AppointmentCardQuickTexts(booking, signature)} 
                buttonClass={`message-appt-${appointment.id}`}
                buttonId={`message-appt-${appointment.id}`}
                launchBtnLabel={<FontAwesomeIcon icon={faEnvelope} />} 
                modalTitle={"Send Message"}  
                tooltipText="Send Message"
                allowOnlyQuickTexts={false}
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
        if (booking && !session.adopterUser && !appointment.checkInTime && !appointment.checkOutTime) {
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
        var isUsersCurrentAppt = false
        if (schedule.userCurrentAppointment) {
            isUsersCurrentAppt = appointment.id == schedule.userCurrentAppointment.id
        }

        if (booking && 
            !appointment.checkInTime &&
            (isUsersCurrentAppt || session.adminUser)) {
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
                launchBtnLabel={<FontAwesomeIcon icon={faTrash} />}
                cancelBtnLabel="Go Back"
                modalTitle="Cancel Appointment"
                tooltipText="Cancel"
            />
        }

        return <></>
    }

    // LOCK BUTTON
    function lockButton() {
        if (session.adminUser && !appointment.checkInTime) {
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
        let canView = false

        if (session.adminUser) {
            canView = !appointment.checkInTime
        }

        if (session.greeterUser) {
            canView = !appointment.getCurrentBooking()
        }

        if (session.adopterUser) {
            canView = ((session.userID == booking?.adopter.userID) || // is their current appointment
                !booking && !schedule.userCurrentAppointment && !appointment.locked) // is unbooked, appointment is open and unlocked
        }

        if (canView) {
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
                launchBtnLabel={<FontAwesomeIcon icon={appointment.checkOutTime || appointment.outcome === 4 ? faPencil : faArrowRightFromBracket} />} 
            />
        }

        return <></>
    }

    // CHECK IN
    function checkInForm() {
        if (!session.adopterUser &&
                !appointment.checkOutTime) {
            return <CheckInForm 
                appointment={appointment} 
                launchBtnLabel={<FontAwesomeIcon icon={appointment.checkInTime ? faPencil : faArrowRightToBracket} />} 
            />
        }

        return <></>
    }

    // NO ACTIONS IF NO SHOW OR IN THE PAST
    if (moment(appointment.instant).isBefore(moment(d)) && !session.adminUser) {
        return []
    }

    if ([AppointmentType.SURRENDER, AppointmentType.VISIT].includes(appointment.type)) {
        return [deleteButton()]
    }

    // ONLY CHECKOUT FORM IF CHECKED OUT
    if (appointment.outcome == 4 || appointment.checkOutTime) {
        return [messageButton(), printButton(), checkOutForm()].reverse()
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