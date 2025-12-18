import { useState } from "react"
import "./Collapsible.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition, faChevronCircleDown, faChevronCircleUp } from "@fortawesome/free-solid-svg-icons"

export interface CollapsibleProps {
    buttonLabel: string,
    className?: string,
    collapseDefault?: boolean,
    disableButton?: boolean
    extendOnSubmit?: () => void,
    items: JSX.Element[],
}

export function Collapsible(props: CollapsibleProps) {
    const { buttonLabel, className, collapseDefault, disableButton = false, extendOnSubmit, items } = props

    const [isCollapsed, setIsCollapsed] = useState<boolean>(collapseDefault ?? true)
    const [icon, setIcon] = useState<IconDefinition>(faChevronCircleUp)

    return <div className={`collapsible-container ${className ?? ""}`}>
        <button
            disabled={disableButton}
            type="button" 
            className="collapsible"
            onClick={() => { 
                setIsCollapsed(!isCollapsed)
                setIcon(isCollapsed ? faChevronCircleDown: faChevronCircleUp)
                if (extendOnSubmit) {
                    extendOnSubmit()
                }
            }}
        >
            <table>
                <tr>
                    <td id="label">{buttonLabel}</td>
                    <td id="icon"><FontAwesomeIcon icon={icon} /></td>
                </tr>
            </table>
        </button>
        <div className={`collapsible-content ${isCollapsed ? "collapse-on" : "collapse-off"}`}>
            <p>{isCollapsed}</p>
            <ul id="item-list">
                {items.map(i => <li>{i}</li>)}
            </ul>
        </div>
    </div>
}