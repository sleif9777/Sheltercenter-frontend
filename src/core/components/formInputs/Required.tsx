import "./Required.scss"

import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export function Required() {
	return <FontAwesomeIcon className="required" icon={faStar} />
}

export function Recommended() {
	return <FontAwesomeIcon className="recommended" icon={faStar} />
}
