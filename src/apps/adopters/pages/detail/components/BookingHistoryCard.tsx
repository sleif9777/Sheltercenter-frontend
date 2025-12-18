import { StandardCard } from "../../../../../components/card/Card";
import { CardColor } from "../../../../../components/card/CardEnums";
import { CardItemListSection } from "../../../../../components/card/CardItemListSection";

export const DefaultBookingHistory: BookingHistory = { 
    adopted: 0,
    completed: 0,
    noShow: 0,
    noDecision: 0 
}

export type BookingHistory = { 
    adopted: number
    completed: number
    noShow: number
    noDecision: number 
}

export interface BookingHistoryCardProps {
    history: BookingHistory
}

export function BookingHistoryCard(props: BookingHistoryCardProps) {
    const { history } = props

    return <StandardCard
        description="Booking History"
        color={CardColor.PINK}
    >
        <CardItemListSection 
            data={[
                { text: `Adopted: ${history.adopted}` },
                { text: `Completed Appointments: ${history.completed}` },
                { text: `No Decisions: ${history.noDecision}` },
                { text: `No Shows: ${history.noShow}` },
            ]} 
            showBorder={false} 
        />
    </StandardCard>
}