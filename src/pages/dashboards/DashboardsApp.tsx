import { useEffect } from "react"

import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"
import { DashboardMode, useDashboardsState } from "./DashboardsAppState"
import { DashboardDog, DashboardDogHash } from "../../models/DogModels"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { DateTime } from "../../utils/DateTime"
import { Weekday } from "../../enums/TemplateEnums"
import { useSessionState } from "../../core/session/SessionState"

type DashboardDogHashKey = Omit<keyof DashboardDogHash, "chosen"> | keyof DashboardDogHash["chosen"]

const DASHBOARD_MODE_OPTIONS: SelectInputOption<DashboardMode>[] = [
	{ label: "Who Went Home", value: DashboardMode.WHO_WENT_HOME },
	{ label: "Chosen", value: DashboardMode.CHOSEN },
	{ label: "FTA", value: DashboardMode.FTA },
]

const DASHBOARD_MODE_ORDER: DashboardMode[] = [DashboardMode.WHO_WENT_HOME, DashboardMode.CHOSEN, DashboardMode.FTA]

// Auto-scroll tuning for the TV; 1px every 40ms = 25px/s.
const CYCLE_MS = 10_000
const SCROLL_HOLD_MS = 5_000
const SCROLL_STEP_PX = 1
const SCROLL_TICK_MS = 40

const DASHBOARD_MODE_TITLES: Record<DashboardMode, string> = {
	[DashboardMode.WHO_WENT_HOME]: "Who Went Home This Week",
	[DashboardMode.CHOSEN]: "Chosen Dogs",
	[DashboardMode.FTA]: "Foster to Adopt",
}

// Keyed by Weekday (Monday-first), matching DateTime.GetWeekday().
const DAY_OF_WEEK_COLORS: Record<Weekday, string> = {
	[Weekday.MONDAY]: "bg-red-200 border-red-800 text-red-800",
	[Weekday.TUESDAY]: "bg-orange-100 border-orange-800 text-orange-800",
	[Weekday.WEDNESDAY]: "bg-yellow-100 border-yellow-800 text-yellow-800",
	[Weekday.THURSDAY]: "bg-green-100 border-green-800 text-green-800",
	[Weekday.FRIDAY]: "bg-blue-100 border-blue-800 text-blue-800",
	[Weekday.SATURDAY]: "bg-purple-100 border-purple-800 text-purple-800",
	[Weekday.SUNDAY]: "bg-rose-200 border-rose-800 text-rose-800", // just in case
}

function getDogCardColor(dog: DashboardDog, key: DashboardDogHashKey, mode: DashboardMode): string {
	if (mode === DashboardMode.WHO_WENT_HOME && key == "newlyInHome" && dog.unavailableDate) {
		const day = new DateTime(dog.unavailableDate).GetWeekday()
		return DAY_OF_WEEK_COLORS[day] ?? "bg-white border-gray-200"
	}

	if (key == "fta" || key == "readyToRoll") {
		return "bg-pink-200 border-pink-700"
	}

	if (key == "needsSN" || key == "needsWC") {
		return "bg-blue-200 border-blue-300"
	}

	return "bg-white border-gray-200"
}

function sortByName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => a.name.localeCompare(b.name))
}

function sortByUnavailableDateThenName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => {
		const dateA = new DateTime(a.unavailableDate)
		const dateB = new DateTime(b.unavailableDate)
		const diff = dateB.DiffWithDate(dateA)
		if (diff !== 0) {
			return diff > 0 ? -1 : 1
		}
		return a.name.localeCompare(b.name)
	})
}

export default function DashboardsApp() {
	usePageTitle("Dashboards")
	const { dogHash, isRefreshing, mode, refresh } = useDashboardsState()
	const session = useSessionState()
	const { cycleEnabled, hideNav } = session.dashboardPreferences

	useEffect(() => {
		refresh()

		const interval = setInterval(
			() => {
				refresh()
			},
			10 * 60 * 1000
		)

		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// One loop per mode: auto-scroll overflowing lists (dashboard login only), then cycle once the scroll is done.
	useEffect(() => {
		const autoScroll = session.dashboardUser
		if (!cycleEnabled && !autoScroll) return

		let cancelled = false
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
		const scroller = document.getElementById("main-content")

		async function scrollThrough() {
			if (!autoScroll || !scroller) return
			scroller.scrollTop = 0
			if (scroller.scrollHeight <= scroller.clientHeight) return

			await sleep(SCROLL_HOLD_MS)
			while (!cancelled && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1) {
				const before = scroller.scrollTop
				scroller.scrollTop += SCROLL_STEP_PX
				if (scroller.scrollTop === before) break
				await sleep(SCROLL_TICK_MS)
			}
			await sleep(SCROLL_HOLD_MS)
			if (!cancelled) scroller.scrollTop = 0
		}

		async function run() {
			while (!cancelled) {
				const start = Date.now()
				await scrollThrough()
				// Hold at least CYCLE_MS per pass, so short lists keep the old 10s cycle and we don't spin.
				await sleep(Math.max(0, CYCLE_MS - (Date.now() - start)))
				if (cancelled) return

				if (cycleEnabled) {
					const nextIndex = (DASHBOARD_MODE_ORDER.indexOf(mode) + 1) % DASHBOARD_MODE_ORDER.length
					useDashboardsState.setState({ mode: DASHBOARD_MODE_ORDER[nextIndex] })
					return // mode change restarts this effect
				}
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [mode, cycleEnabled, session.dashboardUser])

	// ponytail: App.scss forces `ul { columns: 1 !important }` on coarse-pointer devices, which includes the FireStick.
	// `tv:columns-N!` (variant in index.css) re-asserts columns for this page only; layered !important beats unlayered.
	// `tv:[zoom:0.5]`: Silk's CSS viewport is 960x480, too small for 5 columns; 0.5 lays out at 1920x960 like a desktop 1080p.
	// Lists add `tv:[zoom:1.5]` (0.75 net) so cards are readable from across the room. Very long names could overflow.
	return (
		<FullWidthPage>
			<div className="tv:[zoom:0.5] flex flex-col gap-4">
				{/* Sticky inside #main-content, so only the dog lists scroll (manually or via auto-scroll). */}
				<div className="sticky top-0 z-10 flex flex-col gap-4 bg-white pb-2">
					<h1 className="text-3xl font-medium select-none md:text-5xl">{DASHBOARD_MODE_TITLES[mode]}</h1>
					<div className="m-auto flex items-center gap-4">
						<RadioInput
							className=""
							columnOverride="columns-3 tv:columns-3!"
							options={DASHBOARD_MODE_OPTIONS}
							value={mode}
							onChange={(v: DashboardMode) => {
								useDashboardsState.setState({ mode: v })
								if (cycleEnabled) {
									session.setDashboardPreferences({ cycleEnabled: false })
								}
							}}
						/>
						{isRefreshing && <span className="text-sm text-gray-500">Refreshing...</span>}
					</div>

					{session.dashboardUser && (
						<div className="m-auto flex gap-3">
							<button className="large-button" onClick={() => session.setDashboardPreferences({ hideNav: !hideNav })}>
								{hideNav ? "Show Navigation" : "Hide Navigation"}
							</button>
							<button className="large-button" onClick={() => session.setDashboardPreferences({ cycleEnabled: !cycleEnabled })}>
								{cycleEnabled ? "Stop Cycling" : "Start Cycling"}
							</button>
						</div>
					)}
				</div>

				<div key={mode} className="dashboard-fade-in">
					{mode === DashboardMode.WHO_WENT_HOME && (
						<DashboardSection
							className="tv:columns-5! tv:[zoom:1.5] columns-5"
							dogs={sortByUnavailableDateThenName(dogHash.newlyInHome)}
							hashKey="newlyInHome"
							mode={mode}
						/>
					)}

					{mode === DashboardMode.CHOSEN && (
						<div className="tv:[zoom:1.5] m-auto flex w-fit flex-row gap-4">
							<DashboardSection
								className="tv:columns-2! columns-2"
								dogs={sortByName(dogHash.chosen.needsSN)}
								hashKey="needsSN"
								mode={mode}
								title="Needs Spay/Neuter"
							/>
							<DashboardSection
								className="tv:columns-2! columns-2"
								dogs={sortByName(dogHash.chosen.readyToRoll)}
								hashKey="readyToRoll"
								mode={mode}
								title="Ready to Roll"
							/>
							<DashboardSection
								className="tv:columns-2! columns-2"
								dogs={sortByName(dogHash.chosen.needsWC)}
								hashKey="needsWC"
								mode={mode}
								title="Needs Well Check"
							/>
						</div>
					)}

					{mode === DashboardMode.FTA && (
						<DashboardSection className="tv:columns-5! tv:[zoom:1.5] columns-5" dogs={sortByName(dogHash.fta)} hashKey="fta" mode={mode} />
					)}
				</div>
			</div>
		</FullWidthPage>
	)
}

function DashboardSection({
	className,
	hashKey,
	title,
	dogs,
	mode,
}: {
	className?: string
	hashKey: DashboardDogHashKey
	title?: string
	dogs: DashboardDog[]
	mode: DashboardMode
}) {
	return (
		<div className="mx-3 flex flex-col gap-2">
			{title && <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>}
			<h3 className="text-xl font-normal text-gray-700 uppercase">
				Total: {dogs.length} {dogs.length == 1 ? "dog" : "dogs"}
			</h3>
			{dogs.length > 0 && (
				<ul className={className ?? "flex flex-col gap-1"}>
					{dogs.map((dog, i) => (
						<li className={`mb-1 break-inside-avoid border-2 px-3 py-2 ${getDogCardColor(dog, hashKey, mode)}`} key={i}>
							<div className="flex flex-row items-center gap-2">
								<img className="my-1 ml-1 aspect-square w-14 shrink-0 rounded-full" src={dog.photoURL} />
								<span className="mr-1 text-lg font-medium uppercase">{dog.name}</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
