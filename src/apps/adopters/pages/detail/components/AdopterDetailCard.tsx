import { StandardCard } from "../../../../../components/card/Card";
import { CardColor } from "../../../../../components/card/CardEnums";
import { CardTableSection, DataRow } from "../../../../../components/card/CardTableSection";
import { Adopter } from "../../../models/Adopter";
import { AdopterApprovalStatus } from "../../../enums/AdopterEnums";
import { TwoColumnListItem } from "../../../../../components/two_column_list/TwoColumnList";

import "../styles/AdopterDetailCard.scss"
import moment from "moment";

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

// export default function AdopterDetailCard(props: AdopterDetailCardProps) {
//     const { adopter } = props

//     const content = <>
//         <AdopterNotesSection adopter={adopter} />
//         <AboutAdopterSection adopter={adopter} />
//         <ActionsSubsection adopter={adopter} />
//     </>

//     return <GreyCard 
//         className="adopter-detail"
//         description={getCurrentBooking(adopter) ?? "No Appointment Booked"}
//         content={content} 
//     />
// }

// function AdopterNotesSection(props: AdopterDetailCardProps) {
//     const { adopter } = props

//     const dataRows = [
//         {
//             source: "Shelterluv",
//             content: adopter.app_comments
//         },
//         {
//             source: adopter.first_name,
//             content: ""
//         }
//     ]

//     return <table className="subsection adopter-notes border">
//         <tr>
//             <th className="header">Notes</th>
//             <th className="actions">Actions</th>
//         </tr>
//         {dataRows
//             .filter(row => !StringUtils.isNullUndefinedOrEmpty(row.content))
//             .map(row => {
//                 return <tr>
//                     <td className="source">From {row.source}:</td>
//                     <td className="row-content">{row.content}</td>
//                 </tr>
//         })}
//     </table>
// }

// interface TwoColumnListProps {
//     title: string;
//     data: any[];
//     hideBorder?: boolean;
// }

// function TwoColumnList(props: TwoColumnListProps) {
//     const { title, data, hideBorder } = props

//     const columnSetup = splitDataForTwoColList(data)

//     return <table className={`subsection adopter-notes ${hideBorder ? null : "border"}`}>
//         <tr>
//             <th className="header" colSpan={2}>{title}</th>
//         </tr>
//         <tr>
//             <td>
//                 <ul className="two-col-list left">
//                     {columnSetup[0]
//                         .map(item => <li>{item}</li>)}
//                 </ul>
//             </td>
//             <td>
//                 <ul className="two-col-list right">
//                     {columnSetup[1]
//                         .map(item => <li>{item}</li>)}
//                 </ul>
//             </td>
//         </tr>
//     </table>
// }

// function AboutAdopterSection(props: AdopterDetailCardProps) {
//     const { adopter } = props

//     const data = [
//         `Coming from ${adopter.city}, ${adopter.state}`,
//         (adopter.activity_level 
//             ? `${getActivityLevel(adopter)} Activity Level` 
//             : null),
//         (adopter.housing_ownership && adopter.housing_type 
//             ? `${getHousingType(adopter)} (${getHousingOwnership(adopter)})`
//             : null),
//         (adopter.has_fence ? "Has Fence" : "No Fence"),
//     ]

//     return <TwoColumnList title={`About ${adopter.first_name}`} data={data} />
// }

// function ActionsSubsection(props: AdopterDetailCardProps) {
//     const { adopter } = props

//     const data = [
//         `Contact ${adopter.first_name}`,
//         'Print Application',
//         'Edit in Admin',
//         `Schedule ${adopter.first_name}`,
//         'Resend Approval Email',
//         'Set Reminder',
//     ]

//     return <TwoColumnList title={`Actions`} data={data} hideBorder={true} />
// }

// function splitDataForTwoColList(data: any[]): any[][] {
//     data = data.filter(d => !StringUtils.isNullUndefinedOrEmpty(d))

//     const ceil = Math.ceil(data.length / 2)

//     const leftHalf = data.slice(0, ceil)
//     const rightHalf = data.slice(ceil)

//     return [leftHalf, rightHalf]
// }