import { IconDefinition, faCat, faDog, faHorse, faLock, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useStore } from "zustand";

import { StandardCard } from "../../../../../../components/card/Card";
import { CardColor } from "../../../../../../components/card/CardEnums";
import { CardItemListSection } from "../../../../../../components/card/CardItemListSection";
import { CardTableSection, DataRow } from "../../../../../../components/card/CardTableSection";
import { TwoColumnListItem } from "../../../../../../components/two_column_list/TwoColumnList";
import { useSessionState } from "../../../../../../session/SessionState";
import { Appointment } from "../../models/Appointment";
import { useSchedulingHomeState } from "../../state/State";
import { AppointmentCardActions } from "./AppointmentCardActions";
import { Outcome } from "../../../../enums/Enums";
import { DateTime } from "../../../../../../utils/DateTimeUtils";
import { AppointmentTypeFunctions } from "../../../../utils/AppointmentTypeUtils";

export type AppointmentCardContext = "Timeslot" | "Current Appointment" | "Adopter Detail"

interface AppointmentCardProps {
    appointment: Appointment,
    context: AppointmentCardContext // TODO: ENUM
}

export function AppointmentCard(props: AppointmentCardProps) {
    let { appointment, context } = props
    const schedule = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const booking = appointment.getCurrentBooking()
    const notes: DataRow[] = appointment.getNotesToDisplay(session.securityLevel)
        
    const showSingleBookingDisclaimer = schedule.userCurrentAppointment && 
        session.adopterUser &&
        appointment.id != schedule.userCurrentAppointment.id

    const showLockedDisclaimer = session.adopterUser && 
        appointment.locked && 
        !showSingleBookingDisclaimer

    function SingleBookingDisclaimer() {
        return <i>
            You may only have one appointment booked. Cancel your current appointment to enable booking this appointment.
        </i>
    }

    function LockedAppointmentDisclaimer() {
        return <i>
            This appointment is restricted from open booking. If you are interested in this appointment, contact adoptions@savinggracenc.org.
        </i>
    }

    function GetTopDetails() {
        let topDetails: TwoColumnListItem[] = []

        const addItem = (text: string) => {
            topDetails.push({ text: text })
        }

        // Add the type
        addItem("(" + appointment.getType() + ")")

        // If booked and not a no-show, set the visit count
        if (appointment.getCurrentBooking() && appointment.outcome != Outcome.NO_SHOW) {
            addItem(appointment.getAdopterVisitorCount())
        }

        // If checked in, get the timestamp, counselor, and clothing
        if (appointment.checkInTime) {
            const formatted = new DateTime(appointment.checkInTime).Format("h:mm A")

            let checkInDetails = `Checked in ${formatted}`
            if (appointment.counselor) {
                checkInDetails += ` (${appointment.counselor})`
            }
    
            addItem(checkInDetails)
            addItem(appointment.clothingDescription ?? "")
        }

        // If checked out or otherwise completed, get the timestamp and outcome
        if (appointment.checkOutTime) {
            const formatted = new DateTime(appointment.checkOutTime).Format("h:mm A")
            addItem(`Checked out ${formatted}`)
        }
        
        if (appointment.outcome != undefined) {
            addItem(appointment.getOutcome())
        }

        return topDetails
    }

    function ContactInfoSection() {
        return <>
            {booking && <CardItemListSection 
                data={[
                    { text: booking.adopter.primaryEmail ?? "" },
                    { text: booking.adopter.phoneNumber ?? "" }
                ]}
                title="Contact Info"
                showBorder={true}
            />}
        </>
    }

    function NotesSection() {
        return <>
            {notes.length > 0 && <CardTableSection 
                data={notes}
                title="Notes"
                showBorder={appointment.isAdoptionAppointment()}
            />}
        </>
    }

    function AboutSection() {
        if (!booking) {
            return
        }

        let data = [booking.getCreatedInstant()].concat(booking.adopter.getAboutSectionData())

        return <CardItemListSection 
            data={data.map(d => { return { text: d } })}
            title={`About ${booking.adopter.firstName}`}
            showBorder={false}
        />
    }

    function BookingInfo() {
        return <>
            <ContactInfoSection />
            <NotesSection />
            <AboutSection />
        </>
    }

    const showBookingInfo = booking && appointment.outcome == undefined
    const showSurrenderNotes = !showBookingInfo &&
            AppointmentTypeFunctions.isSurrenderAppointment(appointment.type) &&
            appointment.appointmentNotes &&
            appointment.appointmentNotes.length > 0

    function AppointmentDescription() {
        function Icon(props: { def: IconDefinition }) {
            return <FontAwesomeIcon icon={props.def} style={{ marginLeft: 5 }} />
        }

        return <>
            { context == "Current Appointment" || context == "Adopter Detail"
                ? moment(appointment.instant).tz("America/New_York").format("MMM D, h:mm A")
                : appointment.getAppointmentDescription() }
            <span style={{ whiteSpace: "nowrap" }}>
                {appointment.locked && <Icon def={faLock} />}
                {booking?.adopter.mobility && <Icon def={faWheelchair} />}
                {booking?.adopter.bringingDog && <Icon def={faDog} />}
                {booking?.adopter.catsInHome && <Icon def={faCat} />}
                {booking?.adopter.otherPetsInHome && <Icon def={faHorse} />}
            </span>
        </>
    }

    return <StandardCard
        actions={AppointmentCardActions(appointment, context)} 
        color={CardColor.GRAY}
        description={<AppointmentDescription />}
        topDetails={GetTopDetails()}
    >
        {showSingleBookingDisclaimer ? <SingleBookingDisclaimer /> : null}
        {showLockedDisclaimer ? <LockedAppointmentDisclaimer /> : null}
        {showBookingInfo ? <BookingInfo /> : null}
        {showSurrenderNotes ? <NotesSection /> : null}
    </StandardCard>
}