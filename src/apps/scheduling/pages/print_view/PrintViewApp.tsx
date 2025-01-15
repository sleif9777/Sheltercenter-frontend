import moment from "moment"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useStore } from "zustand"

import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import { Appointment, IAppointment } from "../calendar/models/Appointment"
import { useSchedulingHomeState } from "../calendar/state/State"
import { PrintViewRow } from "./components/PrintViewRow"

import "./ReportingPage.scss"

export default function PrintViewApp() {
    const { date } = useParams()
    const store = useStore(useSchedulingHomeState)
    const viewDate = moment(date)
    
    useEffect(() => {
        store.refresh(viewDate.toDate(), [])
    }, [])

    var appointments: Appointment[] = []
    const timeslots = store.timeslots

    timeslots.forEach(t => {
        const newAppts = t.appointments
            .map(a => new Appointment(a as IAppointment))
            .filter(a => a.getCurrentBooking() || a.isAdminAppointment())
        appointments = appointments.concat(newAppts)
    })

    return <FullWidthPage title={store.viewDate.toLocaleDateString()}>
        <table className="report">
            <tr className="no-border">
                <th>Time</th>
                <th>Appointment</th>
                <th>Notes</th>
                <th>Check-In</th>
                <th>Clothing Description</th>
                <th>Counselor</th>
                <th>Check-Out</th>
            </tr>
            {appointments.map(a => {
                return <PrintViewRow appointment={a} />
            })}
        </table>
    </FullWidthPage>
}