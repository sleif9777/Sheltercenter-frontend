import moment from "moment";

import { StandardCard } from "../../../../../components/card/Card";
import { CardColor } from "../../../../../components/card/CardEnums";
import { CardTableSection, DataRow } from "../../../../../components/card/CardTableSection";
import { TwoColumnListItem } from "../../../../../components/two_column_list/TwoColumnList";
import { AdopterApprovalStatus } from "../../../enums/AdopterEnums";
import { Adopter } from "../../../models/Adopter";

import "../styles/AdopterDetailCard.scss"

export default function AdopterDetailCard(props: AdopterDetailCardProps) {
    const { adopter } = props

    const notesSectionData: DataRow[] = [
        {label: "From Shelterluv", content: adopter.applicationComments ?? ""},
        {label: "From Adoptions", content: adopter.internalNotes ?? ""}
    ].filter(note => note.content.length > 0)

    const topDetails: TwoColumnListItem[] = [
        { text: (adopter.city && adopter.state) ? `From ${adopter.city}, ${adopter.state}` : "" },
        { text: adopter.phoneNumber ?? "" },
        { text: adopter.primaryEmail },
    ].filter(detail => detail.text.length > 0)

    const getStatus = () => {
        switch(adopter.status) {
            case AdopterApprovalStatus.APPROVED:
                return { text: `Approved until ${moment(adopter.approvedUntil).format("MMM D, YYYY")}` }
            case AdopterApprovalStatus.DENIED:
                return { text: "Application denied" }
            case AdopterApprovalStatus.PENDING:
                return { text: "Application pending" }
            default:
                return { text: "" }
        }
    }

    topDetails.push(getStatus())
    
    return <StandardCard 
        color={CardColor.GRAY} 
        description={adopter.getFullName()}
        topDetails={topDetails}
    >
        <CardTableSection data={notesSectionData} showBorder={false} />
    </StandardCard>
}

interface AdopterDetailCardProps {
    adopter: Adopter;
}