import "./SubmissionButton.scss"

import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ComponentProps, FormEventHandler, MouseEventHandler, ReactNode } from "react"

import { CardColor } from "../card/CardEnums"

export type CancelClickHandler = MouseEventHandler<HTMLButtonElement>
export type SubmitClickHandler = FormEventHandler<HTMLFormElement>

export interface ButtonProps {
	colorOverride?: CardColor
	icon?: IconDefinition
	label?: ReactNode
	tooltip?: string
}

export type FormSubmitHandler<T> = (req: T) => void

interface SubmissionButtonProps extends ButtonProps {
	disabled?: boolean
	hideIfDisabled?: boolean
	onClick?: CancelClickHandler
	addlProps?: ComponentProps<"button">
}

export interface SubmitButtonProps extends Omit<SubmissionButtonProps, "onClick"> {
	disabled?: boolean
}

export interface CancelButtonProps extends SubmissionButtonProps {}

export function SubmissionButton({ addlProps, colorOverride, disabled, onClick, icon, label }: SubmissionButtonProps) {
	// TODO: find these and similar ones, refactor
	const { hoverBg, hoverText } = {
		[CardColor.RED]: { hoverBg: "hover:bg-red-200", hoverText: "hover:text-red-800" },
		[CardColor.GRAY]: { hoverBg: "hover:bg-gray-200", hoverText: "hover:text-gray-700" },
		[CardColor.BLUE]: { hoverBg: "hover:bg-blue-200", hoverText: "hover:text-blue-900" },
		[CardColor.PINK]: { hoverBg: "hover:bg-pink-200", hoverText: "hover:text-pink-700" },
		[CardColor.PURPLE]: { hoverBg: "hover:bg-purple-200", hoverText: "hover:text-purple-700" },
	}[colorOverride ?? CardColor.PINK]

	const hoverBgClass = disabled ? "" : hoverText
	const hoverTextClass = disabled ? "" : hoverBg

	const bgClass = disabled ? "bg-gray-400" : "bg-gray-200"
	const textClass = disabled ? "text-gray-300" : ""
	const cursorClass = disabled ? "cursor-not-allowed" : "cursor-pointer"

	const allClasses = [bgClass, hoverBgClass, textClass, hoverTextClass, cursorClass].join(" ")

	return (
		<button
			className={`rounded-sm px-5 py-1 text-sm font-normal uppercase ${allClasses}`}
			disabled={disabled}
			onClick={(e) => onClick?.(e)}
			{...addlProps}
		>
			{icon && <FontAwesomeIcon className="mr-1" icon={icon} />} {label}
		</button>
	)
}
