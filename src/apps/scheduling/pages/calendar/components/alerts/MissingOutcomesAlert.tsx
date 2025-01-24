import moment from "moment"
import { useStore } from "zustand"

import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import { CheckOutForm } from "../../forms/booking/CheckOutForm"
import { Appointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import { faPersonCircleQuestion } from "@fortawesome/free-solid-svg-icons"

export function MissingOutcomesAlert() {
    const store = useStore(useSchedulingHomeState)

    if (store.missingOutcomes.length > 0) {
        return <StandardCard
            className="alert"
            color={CardColor.RED}
            description={"Missing Outcomes"} 
            topIcon={faPersonCircleQuestion}
        >
            <CardSectionBase showBorder={false}>
                <b>Enter a decision for:</b>
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