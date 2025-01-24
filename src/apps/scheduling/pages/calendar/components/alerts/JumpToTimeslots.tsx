import moment from "moment"
import { useStore } from "zustand"

import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { TwoColumnListItem } from "../../../../../../components/two_column_list/TwoColumnList"
import { useSchedulingHomeState } from "../../state/State"
import { CardItemListSection } from "../../../../../../components/card/CardItemListSection"
import { faTurnDown } from "@fortawesome/free-solid-svg-icons"

export function JumpToTimeslots() {
    const store = useStore(useSchedulingHomeState)

    const timeslots: TwoColumnListItem[] = store.timeslots.map((t, i) => {
        return { 
            text: moment(t.instant)
                .tz("America/New_York")
                .format("h:mm A"), 
            elementID: `#timeslot-${i}` 
        }
    })

    if (timeslots.length == 0) {
        return
    }

    return <StandardCard
        className="alert"
        color={CardColor.BLUE} 
        description={"Jump to Timeslot"}
        topIcon={faTurnDown}
    >
        <CardItemListSection data={timeslots} showBorder={false} />
    </StandardCard>
}