import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { TooltipProvider } from "../messages/TooltipProvider"

export function HelpHover({ tooltip }: { tooltip: string }) {
	return (
		<span className="mt-px ml-1.5 cursor-help align-middle">
			<TooltipProvider tooltip={tooltip}>
				<FontAwesomeIcon className="hover:text-gray-500" icon={faQuestionCircle} />
			</TooltipProvider>
		</span>
	)
}
