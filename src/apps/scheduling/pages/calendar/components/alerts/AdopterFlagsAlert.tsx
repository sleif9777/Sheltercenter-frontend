import { useStore } from "zustand"

import { StandardCard } from "../../../../../../components/card/Card"
import { CardColor } from "../../../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../../../components/card/CardSectionBase"
import { useSchedulingHomeState } from "../../state/State"
import { faFlag } from "@fortawesome/free-solid-svg-icons"

export interface AdopterFlag {
    name: string,
    summary: string
}

export function AdopterFlagsAlert() {
    const store = useStore(useSchedulingHomeState)

    if (store.adopterFlags.length == 0) {
        return
    }

    return <StandardCard
        className="alert"
        color={CardColor.RED} 
        description={"Adopter Flags"}
        topIcon={faFlag}
    >
        <CardSectionBase showBorder={false}>
            <b>These adopters have multiple no-shows or no-decisions:</b>
            <ul>
                {store.adopterFlags.map(f => 
                    <li>
                        <b>{f.name}</b> - {f.summary}
                    </li>
                )}
            </ul>
        </CardSectionBase>
    </StandardCard>
}