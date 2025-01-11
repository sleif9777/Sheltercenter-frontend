import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./Message.scss"
import { IconDefinition, faCheckCircle, faExclamationCircle, faExclamationTriangle, faShieldDog } from "@fortawesome/free-solid-svg-icons"

export type MessageLevel = "Error" | "Warning" | "Success" | "Default" | "Inline-Error"

interface MessageProps {
    level: MessageLevel,
    message?: string | JSX.Element,
    showMessage: boolean
}

export function Message(props: MessageProps) {
    const { level, message, showMessage } = props
    var iconDef: IconDefinition

    if (!showMessage) {
        return <></>
    }

    switch (level) {
        case "Error":
        case "Inline-Error":
            iconDef = faExclamationCircle
            break
        case "Warning":
            iconDef = faExclamationTriangle
            break
        case "Success":
            iconDef = faCheckCircle
            break
        default:
            iconDef = faShieldDog
    }

    return <div className={`${(level ?? "Default").toLowerCase()} message`}>
        <FontAwesomeIcon icon={iconDef} /> {message}
    </div>
}