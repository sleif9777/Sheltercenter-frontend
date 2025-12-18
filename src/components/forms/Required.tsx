import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Required.scss"

export function Required() {
    return <FontAwesomeIcon className="required" icon={faStar} />
}

export function Recommended() {
    return <FontAwesomeIcon className="recommended" icon={faStar} />
}