import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./Message.scss"
import { IconDefinition, faCheckCircle, faExclamationCircle, faExclamationTriangle, faShieldDog } from "@fortawesome/free-solid-svg-icons"

export type MessageLevel = "Error" | "Warning" | "Success" | "Default" | "Inline-Error"

interface MessageProps {
    level: MessageLevel,
    message?: string | JSX.Element,
    showMessage: boolean,
    icon?: IconDefinition
}

export function Message(props: MessageProps) {
    const { level, message, showMessage, icon } = props

    if (!showMessage) {
        return <></>
    }

    const getIcon = () => {
        switch (level) {
            case "Error":
            case "Inline-Error":
                return faExclamationCircle
            case "Warning":
                return faExclamationTriangle
            case "Success":
                return faCheckCircle
            default:
                return faShieldDog
        }
    }

    var iconDef: IconDefinition = icon ?? getIcon()

    if (!iconDef) {
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
    }

    return <div className={`${(level ?? "Default").toLowerCase()} message`}>
        <FontAwesomeIcon icon={iconDef} /> {message}
    </div>
}