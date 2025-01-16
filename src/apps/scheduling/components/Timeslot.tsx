import moment from "moment"
import { CalendarMode } from "../enums/Enums"
import { IAppointmentBase } from "../models/AppointmentBase"
import { ITemplateAppointment, TemplateAppointment } from "../pages/template/models/TemplateAppointment"
import { TemplateAppointmentCard } from "../pages/template/components/TemplateAppointmentCard"
import { AppointmentCard } from "../pages/calendar/components/card/AppointmentCard"
import { Appointment, IAppointment } from "../pages/calendar/models/Appointment"
import { useState } from "react"
import "../styles/Timeslot.scss"
import { ITimeslot } from "../models/Timeslot"
import { useStore } from "zustand"
import { useSessionState } from "../../../session/SessionState"
import { SecurityLevel } from "../../../session/SecurityLevel"

export interface TimeslotProps extends ITimeslot {
    mode: CalendarMode,
}

export type SimpleTimeslotDictionary = { [key: string]: IAppointmentBase[] }

export type TimeslotDictionary = TimeslotProps[]

export function Timeslot(props: TimeslotProps) {
    const session = useStore(useSessionState)
    var { appointments, mode, instant } = props
    const [label, setLabel] = useState<string>()

    const filterAppointmentsToShow: () => Appointment[] | TemplateAppointment[] = () => {
        if (mode == CalendarMode.TEMPLATE) {
            return appointments.map(a => new TemplateAppointment(a as ITemplateAppointment))
        } else if (mode == CalendarMode.SCHEDULING) {
            const mapped = appointments.map(a => new Appointment(a as IAppointment))

            switch (session.securityLevel) {
                case SecurityLevel.ADOPTER:
                    return mapped.filter(a => {
                        return (a.getCurrentBooking() && 
                            a.getCurrentBooking()?.adopter.userID == session.userID) ||
                            (!a.getCurrentBooking() && a.isAdoptionAppointment())
                    })
                default:
                    return mapped.sort((a, b) => a.id > b.id ? 1 : -1)
            }
        }

        return []
    }

    const renderCardUsingMode = (appointment: IAppointmentBase) => {
        var appointmentObj: TemplateAppointment | Appointment | undefined
        if (mode === CalendarMode.TEMPLATE) {
            appointmentObj = new TemplateAppointment(appointment as ITemplateAppointment)
            return <TemplateAppointmentCard appointment={appointmentObj} />
        } else if (mode === CalendarMode.SCHEDULING) {
            appointmentObj = new Appointment(appointment as IAppointment)
            return <AppointmentCard 
                appointment={appointmentObj} 
                context="Timeslot"
            />
        }

        if (!label && appointmentObj) {
            setLabel(appointmentObj.getTime())
        }
    }

    if (!filterAppointmentsToShow() || filterAppointmentsToShow().length == 0) {
        return <></>
    }

    return <div className="timeslot">
        <table>
            <tr>
                <td className="description">
                    {moment(instant).tz("America/New_York").format("h:mm A")}
                </td>
                <td className="timeslot-actions">
                    {/* TODO: Add form, lock/unlock buttons */}
                </td>
            </tr>
        </table>
        <ul style={{columns: 2}}>
            {filterAppointmentsToShow()
                .sort(TemplateAppointment.compare)
                .map((a) => {
                    return renderCardUsingMode(a)
                })}
        </ul>
    </div>
}