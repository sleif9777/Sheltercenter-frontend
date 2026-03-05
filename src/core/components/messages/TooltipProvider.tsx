import { ReactElement, useId } from "react"
import { PlacesType, Tooltip } from "react-tooltip"

export function TooltipProvider({
	children,
	tooltip,
	place = "bottom",
}: {
	children: ReactElement
	tooltip: string
	place?: PlacesType
}) {
	const id = useId()
	const tooltipID = id + "-ttp"

	return (
		<>
			<span className="inline-flex items-center" data-tooltip-id={tooltipID}>
				{children}
			</span>

			{tooltip.length > 0 && (
				<Tooltip
					className="fixed! z-40 px-2.5 py-1.5 text-[14px]! leading-[1.2] font-normal normal-case"
					content={tooltip}
					id={tooltipID}
					place={place}
				/>
			)}
		</>
	)
}
