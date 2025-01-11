import { useState } from "react"
import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import { Appointment, IAppointment } from "../../models/Appointment"
import moment from "moment"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { AxiosResponse } from "axios"
import { useStore } from "zustand"
import { useSchedulingHomeState } from "../../state/State"
import { CheckOutForm } from "../../forms/booking/CheckOutForm"

export function MissingOutcomesAlert() {
    const store = useStore(useSchedulingHomeState)

    if (store.missingOutcomes.length > 0) {
        return <StandardCard
            className="alert"
            color={CardColor.RED}
            description={"Missing Outcomes"} 
        >
            <CardSectionBase showBorder={false}>
                <span>Enter a decision for:</span>
                <ul>
                    {store.missingOutcomes?.map(a => {
                        const appt = new Appointment(a)
                        return <li>
                            <CheckOutForm 
                                appointment={appt} 
                                btnClass=""
                                launchBtnLabel={`${appt.getCurrentBooking()?.adopter.fullName} - ${moment(appt.instant).format("MMM. D, YYYY")}`} 
                            />
                        </li>
                    })}
                </ul>
            </CardSectionBase>
        </StandardCard>
    }
}