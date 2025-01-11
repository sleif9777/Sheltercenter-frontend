import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSchedulingHomeState } from "../state/State"
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons"
import { useStore } from "zustand"
import { useSessionState } from "../../../../../session/SessionState"
import { SecurityLevel } from "../../../../../session/SecurityLevel"

import "./SchedulingHomeTitle.scss"

export function SchedulingHomeTitle() {
    // const viewDate = useSchedulingHomeState((state) => state.viewDate)
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    var prevDayButton

    if (session.securityLevel != undefined && 
        session.securityLevel <= SecurityLevel.GREETER &&
        store.viewDate < new Date()) {
        prevDayButton = <></>
    } else {
        prevDayButton = <a
            className="switch-date-button left"
            onClick={() => handleSetDateClick(-1)}
        >
            <FontAwesomeIcon icon={faAnglesLeft} />
        </a>
    }


    const nextDayButton = <a
        className="switch-date-button right"
        onClick={() => handleSetDateClick(1)}
    >
        <FontAwesomeIcon icon={faAnglesRight} />
    </a>

    const handleSetDateClick = async (daysToAdd: number) => {
        const newDate = new Date(store.viewDate)
        newDate.setDate(store.viewDate.getDate() + daysToAdd)

        store.refresh(newDate, session.userID)
    }

    return <>
        {prevDayButton}
        {store.viewDate.toLocaleDateString()}
        {nextDayButton}
    </>
}