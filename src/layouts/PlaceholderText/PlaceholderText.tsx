import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./PlaceholderText.scss"

interface PlaceholderTextProps {
    iconDef: IconDefinition;
    text: string;
}

export default function PlaceholderText(props: PlaceholderTextProps) {
    const { iconDef, text } = props

    return <div className="placeholder-text-container">
        <div className="icon">
            <FontAwesomeIcon icon={iconDef} size="6x" />
        </div>
        <div className="body-text">{text}</div>
    </div>
}