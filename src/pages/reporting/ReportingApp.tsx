import { faCircleInfo, faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import {
	DayOfWeekStatsResponse,
	ReportingPeriodStats,
	ReportingStatsResponse,
} from "../../api/appointments/Responses"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import ReportTable, { ColumnDef, Row } from "../../core/components/report/Report"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"

type PeriodKey = "ytd" | "pytd" | "prev_year" | "current_month" | "current_month_py"

const PERIOD_LABELS: Record<PeriodKey, string> = {
	ytd: "YTD",
	pytd: "PYTD",
	prev_year: "Prev Year",
	current_month: "Curr Month",
	current_month_py: "Curr Month PY",
}

const PERIOD_KEYS: PeriodKey[] = ["ytd", "pytd", "prev_year", "current_month", "current_month_py"]

function formatDelta(delta: number): string {
	return delta > 0 ? `+${delta}` : String(delta)
}

function formatDeltaPct(ytd: number, pytd: number): string {
	if (pytd === 0) return "—"
	return `${((ytd - pytd) / pytd * 100).toFixed(1)}%`
}

const NO_PCT_ROWS = new Set(["Total Appointments", "HW+", "HW−"])

function makeOutcomeRow(
	label: string,
	getter: (p: ReportingPeriodStats) => number,
	periods: ReportingStatsResponse["periods"],
	pctPeriod: PeriodKey,
): Row {
	const ytd = getter(periods.ytd)
	const pytd = getter(periods.pytd)
	const total = periods[pctPeriod].total
	const value = getter(periods[pctPeriod])
	const pct = !NO_PCT_ROWS.has(label) && total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "—"

	return {
		metric: label,
		ytd,
		pytd,
		prev_year: getter(periods.prev_year),
		current_month: getter(periods.current_month),
		current_month_py: getter(periods.current_month_py),
		delta: formatDelta(ytd - pytd),
		delta_pct: formatDeltaPct(ytd, pytd),
		pct,
	}
}

function makePipelineRow(
	label: string,
	getter: (p: ReportingPeriodStats) => number,
	periods: ReportingStatsResponse["periods"],
): Row {
	return {
		metric: label,
		ytd: getter(periods.ytd),
		pytd: getter(periods.pytd),
		prev_year: getter(periods.prev_year),
		current_month: getter(periods.current_month),
		current_month_py: getter(periods.current_month_py),
	}
}

const HW_TOOLTIP =
	"Heartworm test results for pending adoptions sourced from this period. Data reliable from Dec 17, 2025 onward; earlier records default to HW−."

const METRIC_COL_WITH_HW_TOOLTIP: ColumnDef = {
	header: "",
	key: "metric",
	headerClassName: "w-[20%]",
	renderFn: (value) => {
		const label = String(value ?? "")
		if (label === "HW+" || label === "HW−") {
			return (
				<TooltipProvider tooltip={HW_TOOLTIP}>
					<span>
						{label} <FontAwesomeIcon className="text-xs text-pink-400" icon={faCircleInfo} />
					</span>
				</TooltipProvider>
			)
		}
		return label
	},
}

const DOW_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function ReportingApp() {
	usePageTitle("Reporting")
	const [stats, setStats] = useState<ReportingStatsResponse | null>(null)
	const [dowStats, setDowStats] = useState<DayOfWeekStatsResponse | null>(null)
	const [pctPeriod, setPctPeriod] = useState<PeriodKey>("ytd")
	const [exporting, setExporting] = useState(false)

	useEffect(() => {
		const api = new AppointmentsAPI()
		api.GetReportingStats().then(setStats)
		api.GetDayOfWeekStats().then(setDowStats)
	}, [])

	const handleExport = useCallback(async () => {
		setExporting(true)
		await new AppointmentsAPI().GetReportingStatsExport()
		setExporting(false)
	}, [])

	if (!stats) {
		return <FullWidthPage title="Reporting">{null}</FullWidthPage>
	}

	const dowColumns: ColumnDef[] = [
		{ header: "Day", key: "day", headerClassName: "w-[12%]" },
		{ header: "Total", key: "total" },
		{ header: "Adoptions", key: "adoptions" },
		{ header: "Chosen", key: "chosen" },
		{ header: "FTA", key: "fta" },
		{ header: "No Decision", key: "no_decision" },
		{ header: "No Show", key: "no_show" },
	]

	const dowRows: Row[] = dowStats
		? DOW_ORDER.map((day) => {
				const d = dowStats.days[day] ?? {
					total: 0,
					adoptions: 0,
					chosen: 0,
					fta: 0,
					no_decision: 0,
					no_show: 0,
				}
				return { day, ...d }
			})
		: []

	const outcomeColumns: ColumnDef[] = [
		METRIC_COL_WITH_HW_TOOLTIP,
		{ header: "YTD", key: "ytd" },
		{ header: "PYTD", key: "pytd" },
		{ header: "Prev Year", key: "prev_year" },
		{ header: "Curr Month", key: "current_month" },
		{ header: "Curr Month PY", key: "current_month_py" },
		{ header: "Δ", key: "delta" },
		{ header: "Δ%", key: "delta_pct" },
		{ header: `% of ${PERIOD_LABELS[pctPeriod]}`, key: "pct" },
	]

	const pipelineColumns: ColumnDef[] = [
		{ header: "", key: "metric", headerClassName: "w-[22%]" },
		{ header: "YTD", key: "ytd" },
		{ header: "PYTD", key: "pytd" },
		{ header: "Prev Year", key: "prev_year" },
		{ header: "Curr Month", key: "current_month" },
		{ header: "Curr Month PY", key: "current_month_py" },
	]

	const outcomeRows = [
		makeOutcomeRow("Total Appointments", (p) => p.total, stats.periods, pctPeriod),
		makeOutcomeRow("Adoptions", (p) => p.adoptions, stats.periods, pctPeriod),
		makeOutcomeRow("Chosen", (p) => p.chosen, stats.periods, pctPeriod),
		makeOutcomeRow("FTA", (p) => p.fta, stats.periods, pctPeriod),
		makeOutcomeRow("No Decision", (p) => p.no_decision, stats.periods, pctPeriod),
		makeOutcomeRow("No Show", (p) => p.no_show, stats.periods, pctPeriod),
		makeOutcomeRow("HW+", (p) => p.hw_positive, stats.periods, pctPeriod),
		makeOutcomeRow("HW−", (p) => p.hw_negative, stats.periods, pctPeriod),
	]

	const pipelineRows = [
		makePipelineRow("Applications Processed", (p) => p.applications, stats.periods),
		makePipelineRow("Visitors", (p) => p.visitors, stats.periods),
		makePipelineRow("Adopted", (p) => p.adopters, stats.periods),
	]

	return (
		<FullWidthPage title="Reporting">
			<div className="mx-2 mt-3 flex items-center justify-between">
				<p className="text-xs text-gray-500">Data reflects current state as of page load.</p>
				<button
					className="flex items-center gap-1.5 rounded border border-pink-700 px-2 py-1 text-sm text-pink-700 transition-colors hover:bg-pink-100 disabled:opacity-50"
					disabled={exporting}
					onClick={handleExport}
				>
					<FontAwesomeIcon icon={faDownload} />
					{exporting ? "Exporting…" : "Export to Excel"}
				</button>
			</div>

			<div className="mx-2 mt-3 flex flex-wrap items-center gap-3 text-sm">
				<span className="font-medium text-gray-600">% column shows:</span>
				{PERIOD_KEYS.map((key) => (
					<label className="flex cursor-pointer items-center gap-1" key={key}>
						<input
							checked={pctPeriod === key}
							className="accent-pink-700"
							name="pctPeriod"
							onChange={() => setPctPeriod(key)}
							type="radio"
							value={key}
						/>
						<span className={pctPeriod === key ? "font-semibold text-pink-700" : "text-gray-600"}>
							{PERIOD_LABELS[key]}
						</span>
					</label>
				))}
			</div>

			<h2 className="mx-2 mt-2 text-lg font-semibold text-pink-700">
				Appointment Outcomes{" "}
				<TooltipProvider
					place="right"
					tooltip="Counts adoption-type appointments (Adults, Puppies, All Ages, Fun Size) with a recorded outcome."
				>
					<FontAwesomeIcon className="text-sm text-pink-400" icon={faCircleInfo} />
				</TooltipProvider>
			</h2>
			<ReportTable columns={outcomeColumns} rows={outcomeRows} />

			<h2 className="mx-2 mt-6 text-lg font-semibold text-pink-700">
				Adopter Pipeline{" "}
				<TooltipProvider
					place="right"
					tooltip="Visitors = distinct adopters who completed at least one appointment. Adopted = distinct adopters whose appointment ended in an adoption."
				>
					<FontAwesomeIcon className="text-sm text-pink-400" icon={faCircleInfo} />
				</TooltipProvider>
			</h2>
			<ReportTable columns={pipelineColumns} rows={pipelineRows} />
			<p className="mx-2 mt-1 text-xs text-gray-400">
				* Applications Processed counts are estimates prior to the date this tracking was introduced.
				Re-applications may be undercounted for older periods.
			</p>

			<h2 className="mx-2 mt-6 text-lg font-semibold text-pink-700">
				Appointments by Day of Week{" "}
				<TooltipProvider
					place="right"
					tooltip="Adoption-type appointments with a recorded outcome, grouped by the day of the week they occurred."
				>
					<FontAwesomeIcon className="text-sm text-pink-400" icon={faCircleInfo} />
				</TooltipProvider>
			</h2>
			<ReportTable columns={dowColumns} rows={dowRows} />

			<div className="mx-2 mt-6 flex flex-wrap gap-6 border-t border-pink-700 pt-4 text-sm">
				<div>
					<span className="font-semibold">Avg visits before adopting:</span>{" "}
					{stats.global.avg_visits_before_adopting.toFixed(1)}
				</div>
				<div>
					<span className="font-semibold">Visitors who never adopted (all-time):</span>{" "}
					{stats.global.visitors_never_adopted}
				</div>
			</div>
		</FullWidthPage>
	)
}
