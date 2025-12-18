import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../styles/LinkToAdopterPage.scss"
import { faBan, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { IAdopterBase } from "../../../models/Adopter";
import { AdopterApprovalStatus } from "../../../enums/AdopterEnums";

interface LinkToAdopterPageProps {
    adopter: IAdopterBase
}

export default function LinkToAdopterPage(props: LinkToAdopterPageProps) {
    const { adopter } = props

    function AdopterStatusIcon(): JSX.Element {
        let icon = <></>
        switch (adopter.status) {
            case AdopterApprovalStatus.PENDING:
                icon = <FontAwesomeIcon icon={faHourglassHalf} />
                break
            case AdopterApprovalStatus.DENIED:
                icon = <FontAwesomeIcon icon={faBan} />
        }
    
        return <span className="status-icon">{icon}</span>
    }

    return <div className="adopter-detail-container">
        <a href={`/adopters/manage/${adopter.ID}`}>
            <div className="full-name">
                {adopter.fullName} <span className="status-icon"><AdopterStatusIcon /></span>
            </div>
            <div className="email">
                {adopter.primaryEmail}
            </div>
        </a>
    </div>
}