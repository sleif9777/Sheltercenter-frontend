// import "./Card.scss"

import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode } from "react"

import { CardColor } from "./CardEnums"
import { CardItem, TwoColumnList } from "./CardListSection"

interface CardContentProps {
	actions?: ReactNode
	children?: ReactNode
	description?: ReactNode
	twoColItems?: CardItem<ReactNode>[]
	topIcon?: IconDefinition
}

interface CardComponentProps extends CardContentProps {
	className?: string
	color: CardColor
	hideTitleBorder?: boolean
	maxWidth?: string
	minWidth?: string
	whiteBg?: boolean
}

interface PhotoCardProps extends CardComponentProps {
	grayscale?: boolean
	photoPath: string
}

export function getCardColorClasses(color: CardColor): { bg: string; border: string; text: string } {
	return {
		[CardColor.RED]: { bg: "bg-red-200", border: "border-red-800", text: "text-red-800" },
		[CardColor.GRAY]: { bg: "bg-gray-100", border: "border-gray-700", text: "text-gray-900" },
		[CardColor.BLUE]: { bg: "bg-blue-100", border: "border-blue-900", text: "text-blue-900" },
		[CardColor.PINK]: { bg: "bg-pink-100", border: "border-pink-800", text: "text-pink-800" },
		[CardColor.PURPLE]: { bg: "bg-purple-100", border: "border-purple-800", text: "text-purple-800" },
	}[color]
}

export function StandardCard({
	actions,
	color,
	children,
	className,
	description,
	hideTitleBorder,
	maxWidth,
	minWidth,
	twoColItems,
	topIcon,
	whiteBg,
}: CardComponentProps) {
	const { bg, border, text } = getCardColorClasses(color)

	const bgClass = whiteBg ? "bg-white" : bg

	return (
		<div
			className={`${className} mx-2.5 mb-5 max-h-fit ${maxWidth} ${minWidth} block break-inside-avoid-column border-2 ${bgClass} ${border}`}
		>
			<div className={`m-auto w-47/48`}>
				<table className={`w-full ${hideTitleBorder ? "" : "border-b " + border} mb-0.5`}>
					<thead>
						<tr className={`${text} text-xl whitespace-nowrap`}>
							<td className={`w-5/9 pl-px text-left font-bold uppercase`}>
								{topIcon && <FontAwesomeIcon icon={topIcon} />} {description}
							</td>
							<td className="w-4/9 space-x-1.5 text-right align-top">{actions}</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={2}>{twoColItems && <TwoColumnList items={twoColItems} />}</td>
						</tr>
					</tbody>
				</table>
				{children}
			</div>
		</div>
	)
}

export function PhotoCard({
	actions,
	color,
	children,
	className,
	description,
	grayscale,
	hideTitleBorder,
	maxWidth,
	minWidth,
	photoPath,
	twoColItems,
	topIcon,
}: PhotoCardProps) {
	const { bg, border, text } = getCardColorClasses(color)

	return (
		<div
			className={`${className} mx-2.5 mb-5 max-h-fit ${maxWidth} ${minWidth} block break-inside-avoid-column border-2 ${bg} ${border}`}
		>
			<div className="m-auto mx-1">
				<table className={`w-full ${hideTitleBorder ? "" : "border-b " + border} mb-0.5`}>
					<thead>
						<tr className={`${text} text-xl whitespace-nowrap`}>
							<td className={`w-5/9 pl-px text-left font-bold uppercase`}>
								{topIcon && <FontAwesomeIcon icon={topIcon} />} {description}
							</td>
							<td className="w-4/9 space-x-1.5 text-right align-top">{actions}</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={2}>{twoColItems && <TwoColumnList items={twoColItems} />}</td>
						</tr>
					</tbody>
				</table>
				<div className="my-1 flex flex-row gap-x-1">
					<img
						className={`m-auto aspect-square w-[50%] max-w-40 rounded-full ` + (grayscale ? "grayscale" : "")}
						src={photoPath}
					/>
					<div>{children}</div>
				</div>
			</div>
		</div>
	)
}
