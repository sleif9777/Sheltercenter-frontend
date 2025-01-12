import moment from "moment"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useStore } from "zustand"

import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import { Appointment, IAppointment } from "../calendar/models/Appointment"
import { useSchedulingHomeState } from "../calendar/state/State"

import "../print_view/ReportingPage.scss"

export default function InProgressAppointmentsApp() {
    const { date } = useParams()
    const store = useStore(useSchedulingHomeState)
    const viewDate = (date == ":date") ? moment(new Date()) : moment(date)
    
    useEffect(() => {
        store.refresh(viewDate.toDate())
    }, [])

    var appointments: Appointment[] = []
    const timeslots = store.timeslots

    timeslots.forEach(t => {
        const newAppts = t.appointments
            .map(a => new Appointment(a as IAppointment))
            .filter(a => a.getCurrentBooking() && 
                (a.checkInTime) && 
                (!a.checkOutTime))
        appointments = appointments.concat(newAppts)
    })

    function calcAppointmentDuration(appointment: Appointment) {
        var startTime = moment(appointment.checkInTime)
        var endTime = moment(new Date())
        var duration = moment.duration(endTime.diff(startTime));

        return `${Math.trunc(duration.asHours())}h ${Math.trunc(duration.asMinutes() % 60)}m ago`
    }

    return <FullWidthPage title={store.viewDate.toLocaleDateString()}>

        <table className="report">
            <tr className="no-border">
                <th>Appointment Time</th>
                <th>Adopter</th>
                <th>Check-In</th>
                <th>Counselor</th>
                <th>Clothing Description</th>
            </tr>
            {appointments.map(a => {
                return <tr>
                    <td>{moment(a.instant).format("h:mm A")}</td>
                    <td>{a.getCurrentBooking()!.adopter.firstName}</td>
                    <td>
                        {moment(a.checkInTime).format("h:mm A")}<br />
                        <span className="small-detail">{calcAppointmentDuration(a)}</span>
                    </td>
                    <td>{a.counselor}</td>
                    <td>{a.clothingDescription}</td>
                </tr>
            })}
        </table>
    </FullWidthPage>
}