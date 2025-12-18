import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TwoColumnPage from "../../../../layouts/TwoColumnPage/TwoColumnPage";
import { AppointmentCard } from "../../../scheduling/pages/calendar/components/card/AppointmentCard";
import { Appointment, IAppointment } from "../../../scheduling/pages/calendar/models/Appointment";
import { AdopterAPI } from "../../api/API";
import { Adopter, IAdopter } from "../../models/Adopter";
import { AdopterForm } from "../../shared_components/AdopterForm";
import { Message } from "../../../../components/message/Message";
import { BookingHistory, BookingHistoryCard, DefaultBookingHistory } from "./components/BookingHistoryCard";

export interface AdopterDetailsAppContext {
    adopter: IAdopter,
    currentAppointment?: IAppointment,
    bookingHistory: BookingHistory
}

interface AdopterDetailsActionButtonProps {
    adopter: IAdopter
}

export default function AdopterDetailsApp() {
    const { id } = useParams()
    const [approvalSent, setApprovalSent] = useState<boolean>(false)
    const [accessRestored, setAccessRestored] = useState<boolean>(false)
    const [adopter, setAdopter] = useState<Adopter>()
    const [appointment, setAppointment] = useState<IAppointment | null>()
    const [bookingHistory, setBookingHistory] = useState<BookingHistory>(DefaultBookingHistory)

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
     
    if (!adopter) {
        return null
    }

    function ResendApprovalButton(props: AdopterDetailsActionButtonProps) {
        if (!adopter || adopter.approvalExpired()) {
            return
        }

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

    function RestoreCalendarAccessButton(props: AdopterDetailsActionButtonProps) {
        if (!adopter || !adopter.restrictedCalendar) {
            return
        }

        return <button 
            className="submit-button" 
            style={{ margin: 5 }} 
            onClick={async () => {
                try {
                    await new AdopterAPI().RestoreCalendarAccess(props.adopter.ID)
                    setAccessRestored(true)
                } catch {
                    setAccessRestored(false)
                }
            }}
        >
            Restore Calendar Access
        </button>
    }

    function AdopterDetailLeftColumn() {
        if (!adopter) {
            return <></>
        }

        return <AdopterForm defaults={adopter} extendOnSubmit={fetchData} context="Manage" />
    }

    function AdopterDetailRightColumn() {
        if (!adopter) {
            return <></>
        }

        return <>
            <Message level={"Success"} showMessage={approvalSent} message={"Approval resent."} />
            <Message level={"Success"} showMessage={accessRestored} message={"Calendar access restored."} />
            <ResendApprovalButton adopter={adopter} />
            <RestoreCalendarAccessButton adopter={adopter} />
            {appointment && <AppointmentCard appointment={new Appointment(appointment)} context={"Adopter Detail"} />}
            <BookingHistoryCard history={bookingHistory} />
        </>
    }

    return <TwoColumnPage 
        leftContent={<AdopterDetailLeftColumn />} 
        rightContent={<AdopterDetailRightColumn />} 
        title={adopter.getFullName()} 
        subtitle={
            [adopter.primaryEmail, adopter.phoneNumber, adopter.getApprovalExpirationDate()]
                .filter(i => i != "")
                .join(" | ")
        }
    />
}