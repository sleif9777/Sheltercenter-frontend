import moment from "moment";

import { Appointment } from "../../calendar/models/Appointment";
import { Booking } from "../../calendar/models/Booking";

interface DailyReportRowProps {
    appointment: Appointment,
    booking: Booking
}

export function DailyReportRow(props: DailyReportRowProps) {
    const { appointment, booking } = props

    return <tr>
        <td>{moment(appointment.instant).tz("America/New_York").format("h:mm A")}</td>
        <td>{booking.adopter.fullName}</td>
        <td>{appointment.getCheckInTime()}</td>
        <td>{appointment.counselor}</td>
        <td>{appointment.getCheckOutTime()}</td>
        <td>{appointment.getOutcome()}</td>
    </tr>
}