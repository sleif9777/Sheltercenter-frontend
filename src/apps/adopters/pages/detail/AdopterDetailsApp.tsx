import { AxiosResponse } from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TwoColumnPage from "../../../../layouts/TwoColumnPage/TwoColumnPage";
import { AppointmentCard } from "../../../scheduling/pages/calendar/components/card/AppointmentCard";
import { IAppointment } from "../../../scheduling/pages/calendar/models/Appointment";
import { AdopterAPI } from "../../api/API";
import { AdopterApprovalStatus } from "../../enums/AdopterEnums";
import { Adopter, IAdopter } from "../../models/Adopter";
import { AdopterForm } from "../../shared_components/AdopterForm";
import { Message } from "../../../../components/message/Message";
import { BookingHistory, BookingHistoryCard } from "./components/BookingHistoryCard";

interface AdopterDetailsAppContext {
    adopter: IAdopter,
    currentAppointment?: IAppointment,
    bookingHistory: BookingHistory
}

export default function AdopterDetailsApp() {

    const { id } = useParams()
    const [approvalSent, setApprovalSent] = useState<boolean | null>(null)
    const [bookingHistory, setBookingHistory] = useState<BookingHistory>({ 
        adopted: 0,
        completed: 0,
        noShow: 0,
        noDecision: 0 
    })

    const fetchData = async () => {
        if (id) {
            const response: AxiosResponse<AdopterDetailsAppContext> = await new AdopterAPI().GetAdopterDetail(parseInt(id))
            setAdopter(new Adopter(response.data.adopter))
            setAppointment(response.data.currentAppointment)
            setBookingHistory(response.data.bookingHistory)
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
        return <button 
            className="submit-button" 
            style={{ margin: 5 }} 
            onClick={async () => {
                try {
                    await new AdopterAPI().ResendApproval(props.adopter.ID)
                    setApprovalSent(true)
                } catch {
                    setApprovalSent(false)
                }
            }}
        >
            Resend Approval
        </button>
    }

    const leftContent = <AdopterForm defaults={adopter} extendOnSubmit={fetchData} context="Manage" />

    const rightContent = () => {
        return <>
            <Message level={"Success"} showMessage={approvalSent === true} message={"Approval resent."} />
            <ResendApprovalButton adopter={adopter} />
            {appointment && <AppointmentCard data={appointment} context={"Adopter Detail"} />}
            <BookingHistoryCard history={bookingHistory} />
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