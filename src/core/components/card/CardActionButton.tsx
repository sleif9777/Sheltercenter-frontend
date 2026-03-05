import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

import { TooltipProvider } from "../messages/TooltipProvider"

export interface CardActionButtonProps {
	className?: string
	primaryIcon: IconProp
	disabled?: boolean
	onClick?: () => void
	onMouseEnter?: () => void
	onMouseLeave?: () => void
	toggle?: {
		default: boolean
		altIcon: IconProp
		altTooltipContent: string
	}
	primaryTooltipContent: string
	tooltipId?: string
}

export function CardActionButton({
	className,
	disabled,
	onMouseEnter,
	onMouseLeave,
	primaryIcon,
	toggle,
	onClick,
	primaryTooltipContent,
}: CardActionButtonProps) {
	const [toggled, setToggled] = useState<boolean>(toggle ? toggle.default : false)
	const [icon, setIcon] = useState<IconProp>(toggled ? toggle!.altIcon : primaryIcon)
	const [tooltipContent, setTooltipContent] = useState<string>(
		toggled ? toggle!.altTooltipContent : primaryTooltipContent
	)

	const handleClick = () => {
		if (toggle) {
			setToggled(!toggled)
			setIcon(toggled ? toggle.altIcon : primaryIcon)
			setTooltipContent(toggled ? toggle.altTooltipContent : primaryTooltipContent)
		}

		onClick?.()
	}

	return (
		<TooltipProvider place="bottom-end" tooltip={tooltipContent}>
			<button
				className={"float-right " + className}
				disabled={disabled}
				onClick={() => handleClick()}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				<FontAwesomeIcon className="disabled:text-grey-200 cursor-pointer hover:opacity-70" icon={icon} />
			</button>
		</TooltipProvider>
	)
}
