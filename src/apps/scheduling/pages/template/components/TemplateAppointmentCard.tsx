import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { StandardCard } from "../../../../../components/card/Card";
import { CardColor } from "../../../../../components/card/CardEnums";
import { TemplateAppointment } from "../models/TemplateAppointment";
import { CardActionButton, CardActionButtonProps } from "../../../../../components/card/CardActionButton";
import { TemplateAppointmentsAPI } from "../api/API";
import { useStore } from "zustand";
import { useTemplateHomeState } from "../state/State";
import { useState } from "react";

interface TemplateAppointmentCardProps {
    appointment: TemplateAppointment
}

export function TemplateAppointmentCard(props: TemplateAppointmentCardProps) {
    const { appointment } = props
    const store = useStore(useTemplateHomeState)

    const [isDeleted, setIsDeleted] = useState<boolean>(false)

    const deleteButton = <CardActionButton 
        extendOnClick={() => {
            if (!appointment.id) {
                return
            }

            new TemplateAppointmentsAPI().delete(appointment.id) 
            store.setWeekday(store.weekday)
            setIsDeleted(true)
        }}
        icon={faTrash}
        id={`delete-appt-${appointment.id}`}
        tooltipContent={"Delete"}
        tooltipId={`delete-appt-${appointment.id}-ttp`}
    />

    if (isDeleted) {
        return
    }

    return <StandardCard
        actions={[deleteButton]} 
        color={CardColor.GRAY}
        description={appointment.getAppointmentDescription()}
    >
        
    </StandardCard>
}