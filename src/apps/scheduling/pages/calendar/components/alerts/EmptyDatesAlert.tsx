import moment from "moment"
import { useStore } from "zustand"

import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import { useSessionState } from "../../../../../../session/SessionState"
import { useSchedulingHomeState } from "../../state/State"
import { faCalendarDay } from "@fortawesome/free-solid-svg-icons"

export function EmptyDatesAlert() {
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    if (store.emptyDates.length == 0) {
        return
    }

    return <StandardCard
        className="alert"
        color={CardColor.RED} 
        description={"Empty Dates"}
        topIcon={faCalendarDay}
    >
        <CardSectionBase showBorder={false}>
            <b>Ensure a full schedule is set for:</b>
            <ul>
                {store.emptyDates.map(d => 
                    <li>
                        <a
                            onClick={() => store.refresh(moment(d).tz("America/New_York").toDate(), [], session.userID!)}
                        >
                            {moment(d).format("dddd, MMMM D, YYYY")}
                        </a>
                    </li>
                )}
            </ul>
        </CardSectionBase>
    </StandardCard>
}