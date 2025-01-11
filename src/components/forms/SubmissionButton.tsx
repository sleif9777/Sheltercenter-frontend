import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./SubmissionButton.scss"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

interface SubmissionButtonProps {
    disabled: boolean,
    icon?: IconDefinition,
    extendOnSubmit: () => any,
    hideIfDisabled?: boolean
    textOverride?: string,
    classOverride?: string,
}

export function SubmissionButton(props: SubmissionButtonProps) {
    const { classOverride, disabled, extendOnSubmit, hideIfDisabled, icon, textOverride } = props

    if ((hideIfDisabled ?? false) && disabled) {
        return
    }

    return <button
        className={`submit-button ${classOverride} ${disabled ? "disabled" : ""}`}
        disabled={disabled}
        onClick={(e) => {
            extendOnSubmit()
            e.preventDefault()
        }}
    >
        {icon ? <FontAwesomeIcon icon={icon} /> : null} {textOverride ?? "Submit"}
    </button>
}