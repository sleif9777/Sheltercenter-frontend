import { AxiosResponse } from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TwoColumnPage from "../../../../layouts/TwoColumnPage/TwoColumnPage";
import { AppointmentCard } from "../../../scheduling/pages/calendar/components/card/AppointmentCard";
import { Appointment, IAppointment } from "../../../scheduling/pages/calendar/models/Appointment";
import { IBooking } from "../../../scheduling/pages/calendar/models/Booking";
import { AdopterAPI } from "../../api/API";
import { AdopterApprovalStatus } from "../../enums/AdopterEnums";
import { Adopter, IAdopter } from "../../models/Adopter";
import { AdopterForm } from "../../shared_components/AdopterForm";
import { Message } from "../../../../components/message/Message";

interface AdopterDetailsAppContext {
    adopter: IAdopter,
    currentAppointment?: IAppointment,
    bookings: IBooking[]
}

export default function AdopterDetailsApp() {

    const { id } = useParams()
    const [approvalSent, setApprovalSent] = useState<boolean | null>(null)

    const fetchData = async () => {
        if (id) {
            const response: AxiosResponse<AdopterDetailsAppContext> = await new AdopterAPI().GetAdopterDetail(parseInt(id))
            setAdopter(new Adopter(response.data.adopter))
            setAppointment(response.data.currentAppointment)
            // setBookings(response.data.bookings)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const [adopter, setAdopter] = useState<Adopter>()
    const [appointment, setAppointment] = useState<IAppointment | null>()
    // const [bookings, setBookings] = useState<IBooking[]>([]) TODO: Make booking history audit
     
    if (!adopter) {
        return null
    }

    const getStatus = () => {
        switch(adopter.status) {
            case AdopterApprovalStatus.APPROVED:
                return `Approved until ${moment(adopter.approvedUntil).format("MMM D, YYYY")}`
            case AdopterApprovalStatus.DENIED:
                return "Application denied"
            case AdopterApprovalStatus.PENDING:
                return "Application pending"
            default:
                return ""
        }
    }

    function ResendApprovalButton(props: { adopter: IAdopter }): JSX.Element {
        return <button className="submit-button" style={{ margin: 5 }} onClick={() => new AdopterAPI().ResendApproval(props.adopter.ID)}>
            Resend Approval
        </button>
    }

    const leftContent = <AdopterForm defaults={adopter} extendOnSubmit={fetchData} context="Manage" />

    const rightContent = () => {
        return <>
            <Message level={"Success"} showMessage={approvalSent === true} message={"Approval resent."} />
            <ResendApprovalButton adopter={adopter} />
            {appointment ? <AppointmentCard appointment={new Appointment(appointment)} context={"Adopter Detail"} /> : <></>}
        </>
    }

    return <TwoColumnPage 
        leftContent={leftContent} 
        rightContent={rightContent()} 
        title={adopter.getFullName()} 
        subtitle={
            [adopter.primaryEmail, adopter.phoneNumber, getStatus()]
                .filter(i => i != "")
                .join(" | ")
        }
    />
}