import moment from "moment"
import { useStore } from "zustand"

import { SecurityLevel } from "../../../session/SecurityLevel"
import { useSessionState } from "../../../session/SessionState"
import { CalendarMode } from "../enums/Enums"
import { IAppointmentBase } from "../models/AppointmentBase"
import { ITimeslot } from "../models/Timeslot"
import { AppointmentCard } from "../pages/calendar/components/card/AppointmentCard"
import { Appointment, IAppointment } from "../pages/calendar/models/Appointment"
import { TemplateAppointmentCard } from "../pages/template/components/TemplateAppointmentCard"
import { ITemplateAppointment, TemplateAppointment } from "../pages/template/models/TemplateAppointment"

import "../styles/Timeslot.scss"
import { DateTime } from "../../../utils/DateTimeUtils"
import { faCalendarXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export interface TimeslotProps<T extends IAppointmentBase> extends ITimeslot<T> {
    mode: CalendarMode,
    index?: string,
}

export type SimpleTimeslotDictionary<T extends IAppointmentBase> = { [key: string]: T[] }

export type TimeslotDictionary<T extends IAppointmentBase> = TimeslotProps<T>[]

export function fullyBookedSlot(ts: TimeslotProps<IAppointment>, userID?: number) {
    return ts.appointments
        .map(a => new Appointment(a))
        .filter(a => a.isAdoptionAppointment())
        .filter(a => a.getCurrentBooking() === null || (!userID || a.getCurrentBooking()?.adopter.ID === userID))
        .length === 0
}

export function fullyBookedDay(day: TimeslotDictionary<IAppointment>, userID?: number) {
    return day.filter(ts => !fullyBookedSlot(ts, userID)).length === 0
}

export function Timeslot(props: TimeslotProps<IAppointment | ITemplateAppointment>) {
    const session = useStore(useSessionState)
    var { appointments, mode, instant, index } = props
    instant = moment(instant)

    const label = new DateTime(instant.toDate(), mode === CalendarMode.TEMPLATE).Format("h:mm A")

    const filterAppointmentsToShow: () => Appointment[] | TemplateAppointment[] = () => {
        if (mode == CalendarMode.TEMPLATE) {
            return appointments.map(a => new TemplateAppointment(a as ITemplateAppointment))
        } else if (mode == CalendarMode.SCHEDULING) {
            const mapped = appointments.map(a => new Appointment(a as IAppointment))
            switch (session.securityLevel) {
                case SecurityLevel.ADOPTER:
                    return mapped.filter(a => a.showToAdopter(session.userID ?? 0))
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
        }
        
        if (mode === CalendarMode.SCHEDULING) {
            appointmentObj = new Appointment(appointment as IAppointment)
            return <AppointmentCard 
                appointment={appointmentObj} 
                context="Timeslot"
            />
        }
    }

    var submessage: JSX.Element = <></>
    if ((!filterAppointmentsToShow() || filterAppointmentsToShow().length == 0) && session.adopterUser) {
        submessage = <span>&mdash; <FontAwesomeIcon icon={faCalendarXmark} /> FULLY BOOKED</span>
    }

    return <div className="timeslot" id={index ? `timeslot-${index}`: ""}>
        <table>
            <tr>
                <td className="description">
                    {label} {submessage}
                </td>
                <td className="timeslot-actions">
                    {/* TODO: Add form, lock/unlock buttons */}
                </td>
            </tr>
        </table>
        <ul style={{columns: 2}}>
            {filterAppointmentsToShow()
                .map((a) => {
                    return renderCardUsingMode(a)
                })}
        </ul>
    </div>
}