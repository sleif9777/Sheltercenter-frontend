import { ReactNode } from "react"

import { ValueLabelPair } from "../formInputs/SelectInput"
import { CardActionButton, CardActionButtonProps } from "./CardActionButton"
import { Defined } from "./CardListSection"

export function CardTableSection({
	actions,
	items,
	showBorder,
	title,
}: {
	actions?: CardActionButtonProps[]
	items?: ValueLabelPair<ReactNode>[]
	showBorder?: boolean
	title?: string
}) {
	const definedItems: ValueLabelPair<Defined<ReactNode>>[] = (items ?? []).filter(
		(i) => i.value != null && i.value != undefined
	) as ValueLabelPair<Defined<ReactNode>>[]

	return (
		<div className={showBorder ? "border-b" : ""}>
			<table className="w-full">
				<thead>
					<tr>
						{title && <th className={`text-left text-lg font-medium whitespace-nowrap`}>{title}</th>}
						<td className="actions">
							{actions &&
								actions.map((action) => (
									<CardActionButton
										primaryIcon={action.primaryIcon}
										primaryTooltipContent={action.primaryTooltipContent}
										toggle={action.toggle}
										tooltipId={action.tooltipId}
										onClick={action.onClick}
									/>
								))}
						</td>
					</tr>
				</thead>
				<tbody>
					{definedItems &&
						definedItems.map((item, key) => (
							<tr className="text-left text-[14px]" key={key}>
								<td className="w-32 pr-2 align-text-top font-semibold">{item.label}:</td>
								<td>{item.value}</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	)
}
