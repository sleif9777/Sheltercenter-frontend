import moment from "moment";
import { Appointment } from "../../calendar/models/Appointment";
import { Booking } from "../../calendar/models/Booking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDog, faLock, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { IPendingAdoption, PendingAdoption } from "../../../../pending_adoptions/models/PendingAdoption";
import { AppointmentType } from "../../../enums/Enums";
import { useEffect, useState } from "react";
import { PendingAdoptionsAPI } from "../../../../pending_adoptions/api/API";
import { AxiosResponse } from "axios";

export interface PrintViewRowProps {
    appointment: Appointment,
    booking?: Booking,
}

export function PrintViewRow(props: PrintViewRowProps) {
    const booking = props.booking, appointment = new Appointment(props.appointment)

    if (appointment.isAdminAppointment()) {
        return <PrintViewAdminRow appointment={appointment} />
    } else if (appointment.getCurrentBooking()) {
        return <PrintViewAppointmentRow appointment={appointment} booking={appointment.getCurrentBooking()!} />
    }
}

export function PrintViewAppointmentRow(props: PrintViewRowProps) {
    const { appointment, booking } = props

    const AdopterInfoCell = <td>
        <b>
            {appointment.getAppointmentDescription()} ({booking!.previousVisits})
            {booking!.adopter.mobility ? <FontAwesomeIcon icon={faWheelchair} style={{ marginLeft: 5 }} /> : null}
            {booking!.adopter.bringingDog ? <FontAwesomeIcon icon={faDog} style={{ marginLeft: 5 }} /> : null}<br />
        </b>
        <div className="small-detail">
            {booking!.adopter.phoneNumber}<br />
            {booking!.adopter.primaryEmail}<br />
            ({appointment.getType()})<br />
            {booking!.getCreatedInstant()}
        </div>
    </td>

    const NotesCell = () => {
        // TODO: Move to model
        const notesDict = [
            { source: "Shelterluv", note: booking!.adopter.applicationComments },
            { source: booking!.adopter.firstName, note: booking!.adopter.adopterNotes },
            { source: "Adoptions", note: booking!.adopter.internalNotes },
        ].filter(n => n.note && n.note.length > 0)

        return <td>
            {notesDict.map(n => <><b>From {n.source}: </b>{n.note}<br /></>)}
        </td>
    } 

    return <tr>
        <td>{moment(appointment.instant).tz("America/New_York").format("h:mm A")}</td>
        {AdopterInfoCell}
        {NotesCell()}
        {/* <td>{booking?.adopter.getFullName()}</td> */}
    </tr>
}

export function PrintViewAdminRow(props: Omit<PrintViewRowProps, "booking">) {
    const { appointment } = props
    const [adoption, setAdoption] = useState<PendingAdoption>()
    
    const fetchAdoptionData = async () => {
        if (appointment.paperworkAdoptionID) {
            const response: AxiosResponse<IPendingAdoption> = await new PendingAdoptionsAPI().getSingleItem(appointment.paperworkAdoptionID)
            setAdoption(new PendingAdoption(response.data))
        }
    }

    useEffect(() => {
        fetchAdoptionData
    }, [])

    const AdopterInfoCell = <td>
        <b>
            {appointment.getAppointmentDescription()}
        </b>
        <div className="small-detail">
            ({appointment.type === AppointmentType.DONATION_DROP_OFF ? "Donation Drop-Off" : appointment.getType()})<br />
        </div>
    </td>

    const NotesCell = () => {
        // TODO: Move to model
        if (appointment.type != AppointmentType.DONATION_DROP_OFF) {
            return <td></td>
        }

        const notesDict = [
            { source: "Appointment", note: appointment.appointmentNotes },
        ].filter(n => n.note && n.note.length > 0)

        return <td>
            {notesDict.map(n => <><b>From {n.source}: </b>{n.note}<br /></>)}
        </td>
    } 

    return <tr>
        <td>{moment(appointment.instant).tz("America/New_York").format("h:mm A")}</td>
        {AdopterInfoCell}
        {NotesCell()}
    </tr>
}