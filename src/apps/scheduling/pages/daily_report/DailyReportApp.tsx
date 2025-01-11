import moment from "moment"
import { useParams } from "react-router-dom"
import { useStore } from "zustand"
import { useSchedulingHomeState } from "../calendar/state/State"
import { useEffect, useState } from "react"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import { Appointment, IAppointment } from "../calendar/models/Appointment"

import "../print_view/ReportingPage.scss"
import { DailyReportRow } from "./components/DailyReportRow"

export default function DailyReportApp() {
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
            .filter(a => a.getCurrentBooking() != null)
        appointments = appointments.concat(newAppts)
    })

    const appointmentRows = appointments.map(a => {
        const booking = a.getCurrentBooking()

        if (!booking) {
            return
        }

        return <DailyReportRow appointment={a} booking={booking} />
    })

    // const [hideCheckInInfo, setHideCheckInInfo] = useState<boolean>(false)

    return <FullWidthPage title={store.viewDate.toLocaleDateString()}>
        {/* <CheckboxField 
            toggleValue={() => setHideCheckInInfo(!hideCheckInInfo)} 
            checkByDefault={false} 
            labelText={"Hide check-in, check-out, and counselor"} 
            id={"hideCheckInInfo"} 
        /> */}
        <table className="report">
            <tr className="no-border">
                <th>Time</th>
                <th>Adopter</th>
                {true ? <>
                    <th>Check-In</th>
                    <th>Counselor</th>
                    <th>Check-Out</th>
                </> : null}
                <th>Outcome</th>
            </tr>
            {appointmentRows}
        </table>
    </FullWidthPage>
}