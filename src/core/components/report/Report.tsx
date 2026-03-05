// import "./Report.scss"

// import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { ReactNode } from "react"
// import { ButtonProps } from "rsuite"

// import { TooltipProvider } from "../messages/TooltipProvider"
// import { AreYouSure } from "../modal/AreYouSure"
// import { useModalState } from "../modal/Modal"

// export type Value = string | number | null

// export type Row = Record<string, Value>

// export type ColumnDef = {
// 	key: string
// 	header: string
// 	renderFn?: ColumnFormatCallback
// }

// export type ColumnFormatCallback = (value?: Value) => ReactNode

// export type ReportTableProps = {
// 	columns: ColumnDef[]
// 	rows: Row[]
// }

// export default function ReportTable({ columns, rows }: { columns: ColumnDef[]; rows: Row[] }) {
// 	return (
// 		<table className="report">
// 			<thead>
// 				<tr className="no-border">
// 					{columns.map((col) => (
// 						<th key={col.key}>{col.header}</th>
// 					))}
// 				</tr>
// 			</thead>

// 			<tbody>
// 				{rows.map((row, i) => (
// 					<tr key={i}>
// 						{columns.map((col) => (
// 							<>
// 								<td key={col.key}>{col.renderFn ? col.renderFn(row[col.key]) : (row[col.key] ?? "")}</td>
// 							</>
// 						))}
// 					</tr>
// 				))}
// 			</tbody>
// 		</table>
// 	)
// }

// export function ReportActionIconButton({
// 	areYouSureOptions,
// 	icon,
// 	onClick,
// 	tooltipContent,
// }: {
// 	areYouSureOptions?: {
// 		modalTitle: string
// 		youWantTo: string
// 	}
// 	icon: IconDefinition
// 	tooltipContent: string
// } & ButtonProps) {
// 	const modalState = useModalState()

// 	if (areYouSureOptions) {
// 		return (
// 			<AreYouSure
// 				modalState={modalState}
// 				modalTitle={areYouSureOptions.modalTitle}
// 				youWantTo={areYouSureOptions.youWantTo}
// 				onSubmit={() => {}}
// 			/>
// 		)
// 	}

// 	return (
// 		<TooltipProvider tooltip={tooltipContent}>
// 			<button className="chosen-board-action" onClick={onClick}>
// 				<FontAwesomeIcon icon={icon} />
// 			</button>
// 		</TooltipProvider>
// 	)
// }
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode } from "react"

import { TooltipProvider } from "../messages/TooltipProvider"
import { AreYouSure } from "../modal/AreYouSure"
import { useModalState } from "../modal/Modal"

export type Value = string | number | null

export type Row = Record<string, Value>

export type ColumnDef = {
	key: string
	header: string
	renderFn?: ColumnFormatCallback
	className?: string
	headerClassName?: string
}

export type ColumnFormatCallback = (value?: Value, row?: Row) => ReactNode

export type ReportTableProps = {
	columns: ColumnDef[]
	rows: Row[]
	className?: string
}

export default function ReportTable({ columns, rows, className = "" }: ReportTableProps) {
	return (
		<div className={`mx-2 mt-3 border-t border-pink-700 pt-3 ${className}`}>
			<table className="w-full text-left">
				<thead className="text-lg underline">
					<tr>
						{columns.map((col) => (
							<th className={col.headerClassName} key={col.key}>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr className={`align-top hover:bg-pink-200 ${i !== rows.length - 1 ? "border-b border-pink-700" : ""}`} key={i}>
							{columns.map((col) => (
								<td className={col.className} key={col.key}>
									{col.renderFn ? col.renderFn(row[col.key], row) : (row[col.key] ?? "")}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export function ReportActionIconButton({
	areYouSureOptions,
	disabled,
	icon,
	onClick,
	tooltipContent,
}: {
	areYouSureOptions?: {
		modalTitle: string
		youWantTo: string
		onSubmit: () => void | Promise<void>
	}
	disabled?: boolean
	icon: IconDefinition
	onClick?: () => void | Promise<void>
	tooltipContent: string
}) {
	const modalState = useModalState()

	if (areYouSureOptions) {
		return (
			<>
				<TooltipProvider tooltip={tooltipContent}>
					<button
						className={`rounded p-1 transition-colors ${
							disabled ? "cursor-not-allowed text-gray-400" : "text-pink-700 hover:bg-pink-100 hover:text-pink-900"
						}`}
						disabled={disabled}
						onClick={modalState.open}
					>
						<FontAwesomeIcon icon={icon} />
					</button>
				</TooltipProvider>
				<AreYouSure
					modalState={modalState}
					modalTitle={areYouSureOptions.modalTitle}
					youWantTo={areYouSureOptions.youWantTo}
					onSubmit={areYouSureOptions.onSubmit}
				/>
			</>
		)
	}

	return (
		<TooltipProvider tooltip={tooltipContent}>
			<button
				className={`rounded p-1 transition-colors ${
					disabled ? "cursor-not-allowed text-gray-400" : "text-pink-700 hover:bg-pink-100 hover:text-pink-900"
				}`}
				disabled={disabled}
				onClick={onClick}
			>
				<FontAwesomeIcon icon={icon} />
			</button>
		</TooltipProvider>
	)
}
