import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { faArrowTrendUp, faStar, faWrench } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { ChangeLogEntryType, ChangeLogEntryTypeLabel } from "../../enums/ChangeLogEnums"
import { IChangeLogEntry } from "./ChangeLogEntries"

const TYPE_CLASSES: Record<ChangeLogEntryType, string> = {
	[ChangeLogEntryType.FEATURE]: "bg-pink-700 text-white",
	[ChangeLogEntryType.IMPROVEMENT]: "bg-pink-100 text-pink-800",
	[ChangeLogEntryType.FIX]: "bg-gray-200 text-gray-800",
}

const TYPE_ICONS: Record<ChangeLogEntryType, IconDefinition> = {
	[ChangeLogEntryType.FEATURE]: faStar,
	[ChangeLogEntryType.IMPROVEMENT]: faArrowTrendUp,
	[ChangeLogEntryType.FIX]: faWrench,
}

export function ChangeLogEntry({ entry }: { entry: IChangeLogEntry }) {
	return (
		<li className="flex items-start gap-x-3">
			<span
				className={`mt-0.5 inline-flex w-28 shrink-0 items-center justify-center gap-x-1.5 rounded px-2 py-0.5 text-xs font-semibold uppercase ${TYPE_CLASSES[entry.type]}`}
			>
				<FontAwesomeIcon icon={TYPE_ICONS[entry.type]} />
				{ChangeLogEntryTypeLabel[entry.type]}
			</span>
			<div>
				<div className="font-medium">{entry.title}</div>
				{entry.details && <div className="text-sm text-gray-600">{entry.details}</div>}
			</div>
		</li>
	)
}
