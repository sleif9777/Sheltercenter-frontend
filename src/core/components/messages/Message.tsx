import {
	faCheckCircle,
	faExclamationCircle,
	faExclamationTriangle,
	faShieldDog,
	IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode } from "react"

export enum MessageLevel {
	Default,
	Success,
	Error,
	Warning,
}

export type MessageBackgroundColor = "bg-gray-100" | "bg-green-100" | "bg-red-100" | "bg-yellow-100"
export type MessageBorderColor = "border-gray-500" | "border-green-500" | "border-red-500" | "border-yellow-500"
export type MessageColor = "text-gray-800" | "text-green-800" | "text-red-800" | "text-yellow-800"

export function Message({
	level = MessageLevel.Default,
	largeIcon,
	message,
	icon,
}: {
	level: MessageLevel
	largeIcon?: boolean
	message: ReactNode
	icon?: IconDefinition
}) {
	let iconDef: IconDefinition,
		textColor: MessageColor = "text-gray-800",
		bgColor: MessageBackgroundColor = "bg-gray-100",
		borderColor: MessageBorderColor = "border-gray-500"

	switch (level) {
		case MessageLevel.Success:
			iconDef = faCheckCircle
			textColor = "text-green-800"
			bgColor = "bg-green-100"
			borderColor = "border-green-500"
			break
		case MessageLevel.Error:
			iconDef = faExclamationCircle
			textColor = "text-red-800"
			bgColor = "bg-red-100"
			borderColor = "border-red-500"
			break
		case MessageLevel.Warning:
			iconDef = faExclamationTriangle
			textColor = "text-yellow-800"
			bgColor = "bg-yellow-100"
			borderColor = "border-yellow-500"
			break
		case MessageLevel.Default:
		default:
			iconDef = faShieldDog
			textColor = "text-gray-800"
			bgColor = "bg-gray-100"
			borderColor = "border-gray-500"
			break
	}

	iconDef = icon ?? iconDef

	// case MessageLevel.Error:
	// 		return faExclamationCircle
	// 	case MessageLevel.Warning:
	// 		return faExclamationTriangle
	// 	case MessageLevel.Success:
	// 		return faCheckCircle
	// 	default:
	// 		return faShieldDog

	return (
		<div
			className={`mx-auto my-1.25 border-2 ${borderColor} px-2.5 py-0.75 font-semibold ${bgColor} ${textColor} text-center text-[15px] wrap-break-word whitespace-normal`}
		>
			<table>
				<tbody>
					<tr>
						<td>
							<FontAwesomeIcon className={"mr-3 " + (largeIcon ? "text-2xl" : "")} icon={iconDef} />
						</td>
						<td>
							<span>{message}</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
