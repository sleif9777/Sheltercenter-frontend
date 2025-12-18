import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

export interface CardActionButtonProps {
    linkTo?: string,
    icon: IconProp,
    id: string,
    extendOnClick: () => void,
    toggle?: {
        default: boolean,
        altIcon: IconProp,
        altTooltipContent: string,
    },
    tooltipContent: string,
    tooltipId: string,
}

export function CardActionButton(props: CardActionButtonProps) {
    let { id, toggle, tooltipId, extendOnClick } = props

    const [toggled, setToggled] = useState<boolean>(toggle ? toggle.default : false)
    const [icon, setIcon] = useState<IconProp>(toggled ? props.toggle!.altIcon : props.icon)
    const [tooltipContent, setTooltipContent] = useState<string>(toggled ? props.toggle!.altTooltipContent: props.tooltipContent)

    const handleClick = () => {
        if (toggle) {
            setToggled(!toggled)
            setIcon(toggled ? toggle.altIcon : props.icon)
            setTooltipContent(toggled ? toggle.altTooltipContent : props.tooltipContent)
        }

        if (extendOnClick) {
            extendOnClick()
        }
    }

    return <>
        <button 
            data-tooltip-id={tooltipId}
            id={id}
            onClick={() => handleClick()}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
        <Tooltip 
            anchorSelect={`#${id}`}
            id={tooltipId}
            content={tooltipContent}
            place="bottom-start"
        />
    </>
}