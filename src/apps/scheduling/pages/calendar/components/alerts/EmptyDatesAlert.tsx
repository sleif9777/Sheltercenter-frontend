import moment from "moment"
import { useStore } from "zustand"

import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import { TwoColumnList } from "../../../../../../components/two_column_list/TwoColumnList"
import { useSessionState } from "../../../../../../session/SessionState"
import { useSchedulingHomeState } from "../../state/State"

interface EmptyDatesAlertProps {
    emptyDates: Date[]
}

export function EmptyDatesAlert(props: EmptyDatesAlertProps) {
    const { emptyDates } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    if (emptyDates.length == 0) {
        return
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