import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { AdopterApprovalStatus, IAdopterDTO, getFullNameDTO } from "../../shared/interfaces/IAdopterDTO";

import "../styles/LinkToAdopterPage.scss"
import { faBan, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { Adopter } from "../../../models/Adopter";
import { AdopterApprovalStatus } from "../../../enums/AdopterEnums";

interface LinkToAdopterPageProps {
    adopter: Adopter
}

export default function LinkToAdopterPage(props: LinkToAdopterPageProps) {
    const { adopter } = props

    return <div className="adopter-detail-container">
        <a 
            href={`/adopters/manage/${adopter.ID}`}
        >
            <div className="full-name">
                {adopter.getFullName()} <span className="status-icon">{getAdopterStatusIcon(adopter)}</span>
            </div>
            <div className="email">
                {adopter.primaryEmail}
            </div>
        </a>
    </div>
}

function getAdopterStatusIcon(adopter: Adopter): JSX.Element | null {
    switch (adopter.status) {
        case AdopterApprovalStatus.PENDING:
            return <FontAwesomeIcon icon={faHourglassHalf} />
        case AdopterApprovalStatus.DENIED:
            return <FontAwesomeIcon icon={faBan} />
    }

    return null
}