import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { DateTime } from "../../utils/DateTime"
import { usePageTitle } from "../../utils/usePageTitle"
import { CHANGE_LOG_ENTRIES, IChangeLogEntry } from "./ChangeLogEntries"
import { ChangeLogEntry } from "./ChangeLogEntry"

function groupByDate(entries: IChangeLogEntry[]): [string, IChangeLogEntry[]][] {
	const groups = new Map<string, IChangeLogEntry[]>()
	for (const entry of entries) {
		groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry])
	}
	// ISO dates sort lexically; newest first
	return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
}

const OLDER_THAN_DAYS = 60

function DateGroups({ entries }: { entries: IChangeLogEntry[] }) {
	return groupByDate(entries).map(([date, group]) => (
		<section className="flex flex-col gap-y-2" key={date}>
			<h2 className="text-xl font-semibold text-pink-700">{DateTime.FromISODate(date).GetFullDate()}</h2>
			<ul className="flex flex-col gap-y-2">
				{group.map((entry, i) => (
					<ChangeLogEntry entry={entry} key={i} />
				))}
			</ul>
		</section>
	))
}

export default function ChangeLogApp() {
	usePageTitle("Change Log")

	// ISO dates compare lexically
	const cutoff = new DateTime().GetDiffedDate(-OLDER_THAN_DAYS)
	const recent = CHANGE_LOG_ENTRIES.filter((e) => e.date >= cutoff)
	const older = CHANGE_LOG_ENTRIES.filter((e) => e.date < cutoff)

	return (
		<FullWidthPage title="Change Log">
			<div className="mx-5 mt-3 flex flex-col gap-y-4 border-t border-pink-700 py-2 text-left">
				<DateGroups entries={recent} />
				{older.length > 0 && (
					<details className="border-t border-pink-700 pt-2">
						<summary className="cursor-pointer text-xl font-semibold text-pink-700 uppercase select-none">Older Changes</summary>
						<div className="mt-3 flex flex-col gap-y-4">
							<DateGroups entries={older} />
						</div>
					</details>
				)}
			</div>
		</FullWidthPage>
	)
}
