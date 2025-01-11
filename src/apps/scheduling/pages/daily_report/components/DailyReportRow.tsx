import moment from "moment";
import { Appointment } from "../../calendar/models/Appointment";
import { Booking } from "../../calendar/models/Booking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDog, faLock, faWheelchair } from "@fortawesome/free-solid-svg-icons";

interface DailyReportRowProps {
    appointment: Appointment,
    booking: Booking
}

export function DailyReportRow(props: DailyReportRowProps) {
    const { appointment, booking } = props

    const AdopterInfoCell = <td>
        <b>
            {appointment.getAppointmentDescription()} ({booking.previousVisits})
            {booking.adopter.mobility ? <FontAwesomeIcon icon={faWheelchair} style={{ marginLeft: 5 }} /> : null}
            {booking.adopter.bringingDog ? <FontAwesomeIcon icon={faDog} style={{ marginLeft: 5 }} /> : null}<br />
        </b>
        <div className="small-detail">
            {booking.adopter.phoneNumber}<br />
            {booking.adopter.primaryEmail}<br />
            ({appointment.getType()})<br />
            {booking.getCreatedInstant()}
        </div>
    </td>

    const NotesCell = () => {
        // TODO: Move to model
        const notesDict = [
            { source: "Shelterluv", note: booking.adopter.applicationComments },
            { source: booking.adopter.firstName, note: booking.adopter.adopterNotes },
            { source: "Adoptions", note: booking.adopter.internalNotes },
        ].filter(n => n.note && n.note.length > 0)

        return <td>
            {notesDict.map(n => <><b>From {n.source}: </b>{n.note}<br /></>)}
        </td>
    } 

    return <tr>
        <td>{moment(appointment.instant).tz("America/New_York").format("h:mm A")}</td>
        <td>{booking.adopter.fullName}</td>
        <td>{appointment.getCheckInTime()}</td>
        <td>{appointment.counselor}</td>
        <td>{appointment.getCheckOutTime()}</td>
        <td>{appointment.getOutcome()}</td>
        {/* <td>{booking?.adopter.getFullName()}</td> */}
    </tr>
}