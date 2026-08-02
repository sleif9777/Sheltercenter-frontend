import { useEffect, useState } from "react"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { ReportingPeriodStats, ReportingStatsResponse } from "../../api/appointments/Responses"
import ReportTable, { ColumnDef, Row } from "../../core/components/report/Report"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"

const PERIOD_COLUMNS: ColumnDef[] = [
	{ header: "", key: "metric", headerClassName: "w-[30%]" },
	{ header: "YTD", key: "ytd" },
	{ header: "PYTD", key: "pytd" },
	{ header: "Prev Year", key: "prev_year" },
	{ header: "Curr Month", key: "current_month" },
	{ header: "Curr Month PY", key: "current_month_py" },
]

function makeRow(label: string, getter: (p: ReportingPeriodStats) => number, periods: ReportingStatsResponse["periods"]): Row {
	return {
		metric: label,
		ytd: getter(periods.ytd),
		pytd: getter(periods.pytd),
		prev_year: getter(periods.prev_year),
		current_month: getter(periods.current_month),
		current_month_py: getter(periods.current_month_py),
	}
}

function buildOutcomeRows(periods: ReportingStatsResponse["periods"]): Row[] {
	return [
		makeRow("Total Appointments", (p) => p.total, periods),
		makeRow("Adoptions", (p) => p.adoptions, periods),
		makeRow("Chosen", (p) => p.chosen, periods),
		makeRow("FTA", (p) => p.fta, periods),
		makeRow("No Decision", (p) => p.no_decision, periods),
		makeRow("No Show", (p) => p.no_show, periods),
		makeRow("HW+", (p) => p.hw_positive, periods),
		makeRow("HW−", (p) => p.hw_negative, periods),
	]
}

function buildPipelineRows(periods: ReportingStatsResponse["periods"]): Row[] {
	return [
		makeRow("Applications Processed", (p) => p.applications, periods),
		makeRow("Visitors", (p) => p.visitors, periods),
		makeRow("Adopted", (p) => p.adopters, periods),
	]
}

export default function ReportingApp() {
	usePageTitle("Reporting")
	const [stats, setStats] = useState<ReportingStatsResponse | null>(null)

	useEffect(() => {
		new AppointmentsAPI().GetReportingStats().then(setStats)
	}, [])

	if (!stats) {
		return <FullWidthPage title="Reporting">{null}</FullWidthPage>
	}

	const outcomeRows = buildOutcomeRows(stats.periods)
	const pipelineRows = buildPipelineRows(stats.periods)

	return (
		<FullWidthPage title="Reporting">
			<h2 className="mx-2 mt-4 text-lg font-semibold text-pink-700">Appointment Outcomes</h2>
			<ReportTable columns={PERIOD_COLUMNS} rows={outcomeRows} />

			<h2 className="mx-2 mt-6 text-lg font-semibold text-pink-700">Adopter Pipeline</h2>
			<ReportTable columns={PERIOD_COLUMNS} rows={pipelineRows} />

			<div className="mx-2 mt-6 flex gap-6 border-t border-pink-700 pt-4 text-sm">
				<div>
					<span className="font-semibold">Avg visits before adopting:</span>{" "}
					{stats.global.avg_visits_before_adopting.toFixed(1)}
				</div>
				<div>
					<span className="font-semibold">Visitors who never adopted:</span>{" "}
					{stats.global.visitors_never_adopted}
				</div>
			</div>
		</FullWidthPage>
	)
}
