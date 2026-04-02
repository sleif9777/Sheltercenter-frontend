import { faExclamationCircle, faStar, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode } from "react"

import { TooltipProvider } from "../messages/TooltipProvider"

export function InputLabel({
	fieldLabel,
	elemID,
	errors,
	showError,
	showRequired,
	showRecommended,
}: {
	fieldLabel: ReactNode
	elemID?: string
	errors?: string[]
	showError?: boolean
	showRequired?: boolean
	showRecommended?: boolean
}) {
	const tooltip = errors
		? Object.values(errors)
				.flat()
				.map((msg) => msg)
				.join("\n")
		: ""

	return (
		<label className="text-left!" htmlFor={elemID}>
			<span className="text-[16px] font-medium uppercase">{fieldLabel}</span>
			<span className="ml-1.75">
				{showError && (
					<TooltipProvider place="right" tooltip={tooltip}>
						<FontAwesomeIcon className="text-pink-700" icon={faExclamationCircle} />
					</TooltipProvider>
				)}
				{showRequired && (
					<TooltipProvider place="right" tooltip="This field is required">
						<FontAwesomeIcon className="text-pink-700" icon={faStar} />
					</TooltipProvider>
				)}
				{showRecommended && (
					<TooltipProvider place="right" tooltip="This field is recommended">
						<FontAwesomeIcon className="text-yellow-500" icon={faTriangleExclamation} />
					</TooltipProvider>
				)}
			</span>
		</label>
	)
}

export function InputErrorLabel({ errors, isWarning }: { errors: string[]; isWarning?: boolean }) {
	return (
		<div className={`text-left text-xs font-semibold ${isWarning ? "text-yellow-600" : "text-pink-700"}`}>
			<ul>
				{errors.map((e, i) => (
					<li key={i}>{e}</li>
				))}
			</ul>
		</div>
	)
}
