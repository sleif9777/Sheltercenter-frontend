import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import moment from "moment"
import { useSchedulingHomeState } from "../../state/State"
import { useStore } from "zustand"
import { useState } from "react"
import { CardActionButtonProps } from "../../../../../../components/card/CardActionButton"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import { TwoColumnList } from "../../../../../../components/two_column_list/TwoColumnList"
import { useSessionState } from "../../../../../../session/SessionState"

interface EmptyDatesAlertProps {
    emptyDates: Date[]
}

export function EmptyDatesAlert(props: EmptyDatesAlertProps) {
    const { emptyDates } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const [hide, setHide] = useState<boolean>(false)

    if (hide || emptyDates.length == 0) {
        return
    }

    const closeButton: CardActionButtonProps = {
        icon: faClose,
        id: "close-empty-dates-alert",
        extendOnClick: () => setHide(true),
        tooltipContent: "Close",
        tooltipId: "close-empty-dates-alert-btn"
    }

    return <StandardCard
        className="alert"
        color={CardColor.RED} 
        description={"Empty Dates"}
    >
        <CardSectionBase showBorder={false}>
            <b>Ensure a full schedule is set for:</b>
            <TwoColumnList 
                data={emptyDates.map(date => {return { text: moment(date).format("dddd, MMMM D, YYYY") }})}
                itemRender={(i) => {
                    return <>
                        <a onClick={() => store.refresh(moment(i.text).tz("America/New_York").toDate(), session.userID!)}>
                            {i.text}
                        </a><br/>
                    </>
                }}
            />
        </CardSectionBase>
    </StandardCard>
}