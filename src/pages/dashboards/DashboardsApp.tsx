import { faEyeSlash, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"
import { DashboardMode, useDashboardsState } from "./DashboardsAppState"
import { DashboardDog, DashboardDogHash } from "../../models/DogModels"
import { CardActionAreYouSure } from "../../core/components/card/CardActionAreYouSure"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { DateTime } from "../../utils/DateTime"
import { Weekday } from "../../enums/TemplateEnums"
import { useSessionState } from "../../core/session/SessionState"
import DashboardDebugOverlay from "./DashboardDebugOverlay"
import { getDashboardScroller } from "./dashboardScroller"

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
// Give up on a pass only if the scroller stays this far behind for this many ticks in a row.
const SCROLL_STUCK_TOLERANCE_PX = 2
const SCROLL_MAX_STUCK_TICKS = 25
// Wait this long at most for an in-flight refresh before measuring the list.
const REFRESH_WAIT_MAX_MS = 15_000
const REFRESH_POLL_MS = 250

// TV layout is designed at 1920px wide; zoom scales it to the real viewport (Silk reports 960px on a 1080p stick).
const TV_DESIGN_WIDTH_PX = 1920

const DASHBOARD_MODE_TITLES: Record<DashboardMode, string> = {
	[DashboardMode.WHO_WENT_HOME]: "Who Went Home This Week",
	[DashboardMode.CHOSEN]: "Chosen Dogs",
	[DashboardMode.FTA]: "Foster to Adopt",
}

// Card colors are literal hex (Tailwind v3 palette values) instead of theme classes like `bg-red-200`.
// Tailwind v4 theme colors are oklch-only, and older Silk builds render those as transparent.
// Weekdays use 200 shades so they still read on a washed-out monitor.
// Keyed by Weekday (Monday-first), matching DateTime.GetWeekday().
const DAY_OF_WEEK_COLORS: Record<Weekday, string> = {
	[Weekday.MONDAY]: "border-[#991b1b] bg-[#fecaca] text-[#991b1b]", // red
	[Weekday.TUESDAY]: "border-[#9a3412] bg-[#fed7aa] text-[#9a3412]", // orange
	[Weekday.WEDNESDAY]: "border-[#854d0e] bg-[#fef08a] text-[#854d0e]", // yellow
	[Weekday.THURSDAY]: "border-[#166534] bg-[#bbf7d0] text-[#166534]", // green
	[Weekday.FRIDAY]: "border-[#1e40af] bg-[#bfdbfe] text-[#1e40af]", // blue
	[Weekday.SATURDAY]: "border-[#6b21a8] bg-[#e9d5ff] text-[#6b21a8]", // purple
	[Weekday.SUNDAY]: "border-[#9f1239] bg-[#fecdd3] text-[#9f1239]", // rose, just in case
}
const DEFAULT_CARD_COLOR = "border-[#e5e7eb] bg-[#ffffff]" // gray-200 / white
const FTA_CARD_COLOR = "border-[#be185d] bg-[#fbcfe8]" // pink-700 / pink-200
const CHOSEN_CARD_COLOR = "border-[#93c5fd] bg-[#bfdbfe]" // blue-300 / blue-200

function showsWeekday(dog: DashboardDog, key: DashboardDogHashKey, mode: DashboardMode): boolean {
	return mode === DashboardMode.WHO_WENT_HOME && key == "newlyInHome" && !!dog.unavailableDate
}

function showsPaperworkAppointment(dog: DashboardDog, key: DashboardDogHashKey, mode: DashboardMode): boolean {
	return mode === DashboardMode.CHOSEN && key == "readyToRoll" && !!dog.paperworkAppointmentInst
}

function getDogCardColor(dog: DashboardDog, key: DashboardDogHashKey, mode: DashboardMode): string {
	if (showsWeekday(dog, key, mode)) {
		const day = DateTime.FromISODate(dog.unavailableDate).GetWeekday()
		return DAY_OF_WEEK_COLORS[day] ?? DEFAULT_CARD_COLOR
	}

	if (key == "fta" || key == "readyToRoll") {
		return FTA_CARD_COLOR
	}

	if (key == "needsSN" || key == "needsWC") {
		return CHOSEN_CARD_COLOR
	}

	return DEFAULT_CARD_COLOR
}

function sortByName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => a.name.localeCompare(b.name))
}

function sortByUnavailableDateThenName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => {
		const dateA = DateTime.FromISODate(a.unavailableDate)
		const dateB = DateTime.FromISODate(b.unavailableDate)
		const diff = dateB.DiffWithDate(dateA)
		if (diff !== 0) {
			return diff > 0 ? -1 : 1
		}
		return a.name.localeCompare(b.name)
	})
}

function getTvZoom(): number {
	return window.innerWidth / TV_DESIGN_WIDTH_PX
}

export default function DashboardsApp() {
	usePageTitle("Dashboards")
	const { dogHash, isRefreshing, lastRefreshFailed, lastUpdated, mode, refresh } = useDashboardsState()
	const session = useSessionState()
	const { cycleEnabled, hideNav } = session.dashboardPreferences
	const [searchParams] = useSearchParams()
	const showDebug = searchParams.get("debug") === "1"

	// Admins and superusers can hide Who Went Home / FTA dogs; everyone else never receives hidden dogs.
	const canHide = session.adminUser

	// TV mode is tied to the dashboard login, not to pointer/hover media queries, which Silk reports inconsistently.
	const tvMode = session.dashboardUser
	const [tvZoom, setTvZoom] = useState(getTvZoom)
	// Bumped when the page becomes visible again (screensaver, sleep), so the auto-scroll loop restarts cleanly.
	const [resumeCount, setResumeCount] = useState(0)

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

	useEffect(() => {
		if (!tvMode) return

		const onResize = () => setTvZoom(getTvZoom())
		onResize()
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [tvMode])

	// Keep the monitor awake where Silk supports it, and recover after the page was hidden.
	// Chromium pauses timers on hidden pages and drops wake locks, so both need redoing on return.
	useEffect(() => {
		if (!tvMode) return

		let lock: WakeLockSentinel | null = null
		let disposed = false

		async function requestWakeLock() {
			if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return
			try {
				const acquired = await navigator.wakeLock.request("screen")
				if (disposed) {
					acquired.release().catch(() => {})
				} else {
					lock = acquired
				}
			} catch {
				// Unsupported or denied; the device's screensaver settings are the fallback.
			}
		}

		function onVisibilityChange() {
			if (document.visibilityState !== "visible") return
			requestWakeLock()
			useDashboardsState.getState().refresh()
			setResumeCount((count) => count + 1)
		}

		requestWakeLock()
		document.addEventListener("visibilitychange", onVisibilityChange)
		return () => {
			disposed = true
			document.removeEventListener("visibilitychange", onVisibilityChange)
			lock?.release().catch(() => {})
		}
	}, [tvMode])

	// One loop per mode: auto-scroll overflowing lists (dashboard login only), then cycle once the scroll is done.
	useEffect(() => {
		const autoScroll = session.dashboardUser
		if (!cycleEnabled && !autoScroll) return

		let cancelled = false
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

		async function waitForRefresh() {
			for (let waited = 0; !cancelled && useDashboardsState.getState().isRefreshing && waited < REFRESH_WAIT_MAX_MS; waited += REFRESH_POLL_MS) {
				await sleep(REFRESH_POLL_MS)
			}
		}

		async function scrollThrough() {
			if (!autoScroll) return
			// Resolved per pass: #main-content when it scrolls, otherwise the document (older Silk builds).
			const scroller = getDashboardScroller()
			if (!scroller) return
			scroller.scrollTop = 0

			// Measure after any in-flight refresh and the hold, so late data and layout have settled.
			await waitForRefresh()
			await sleep(SCROLL_HOLD_MS)
			const maxScroll = () => scroller.scrollHeight - scroller.clientHeight
			if (cancelled || maxScroll() <= 1) return

			// Track the position as a float. With a fractional pixel ratio (e.g. a 720p HDMI handshake), `scrollTop += 1`
			// can round back to the same value, so only stop when the scroller stays behind for a while.
			let pos = 0
			let stuckTicks = 0
			while (!cancelled && pos < maxScroll()) {
				pos = Math.min(pos + SCROLL_STEP_PX, maxScroll())
				scroller.scrollTo(0, pos)
				stuckTicks = Math.abs(scroller.scrollTop - pos) > SCROLL_STUCK_TOLERANCE_PX ? stuckTicks + 1 : 0
				if (stuckTicks >= SCROLL_MAX_STUCK_TICKS) break
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
	}, [mode, cycleEnabled, session.dashboardUser, resumeCount])

	// TV mode: `.tv-mode` enables the `tv:` variant (index.css) and exempts these lists from App.scss's forced single column.
	// The wrapper zooms the 1920px design down to the real viewport; lists add `tv:[zoom:1.5]` so cards are readable
	// from across the room (0.75 net on a 960px viewport). Very long names could overflow.
	return (
		<FullWidthPage>
			<div className={`flex flex-col gap-4 ${tvMode ? "tv-mode" : ""}`} style={tvMode ? { zoom: tvZoom } : undefined}>
				{/* Sticky inside the scroller, so only the dog lists scroll (manually or via auto-scroll). */}
				<div className="sticky top-0 z-10 flex flex-col gap-4 bg-white pb-2">
					<h1 className="text-3xl font-medium select-none md:text-5xl">{DASHBOARD_MODE_TITLES[mode]}</h1>
					<div className="m-auto flex items-center gap-4">
						<RadioInput
							className=""
							columnOverride="columns-3"
							options={DASHBOARD_MODE_OPTIONS}
							value={mode}
							onChange={(v: DashboardMode) => {
								useDashboardsState.setState({ mode: v })
								if (cycleEnabled) {
									session.setDashboardPreferences({ cycleEnabled: false })
								}
							}}
						/>
						<RefreshStatus failed={lastRefreshFailed} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
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

				<div className="dashboard-fade-in" key={mode}>
					{mode === DashboardMode.WHO_WENT_HOME && (
						<DashboardSection
							canHide={canHide}
							className="tv:[zoom:1.5] columns-5"
							dogs={sortByUnavailableDateThenName(dogHash.newlyInHome)}
							hashKey="newlyInHome"
							mode={mode}
						/>
					)}

					{/* Fixed thirds instead of `w-fit`: fit-content around multi-column lists sizes differently across Chromium versions. */}
					{mode === DashboardMode.CHOSEN && (
						<div className="tv:[zoom:1.5] grid grid-cols-3 gap-4">
							<DashboardSection className="columns-2" dogs={sortByName(dogHash.chosen.needsSN)} hashKey="needsSN" mode={mode} title="Needs Spay/Neuter" />
							<DashboardSection
								className="columns-2"
								dogs={sortByName(dogHash.chosen.readyToRoll)}
								hashKey="readyToRoll"
								mode={mode}
								title="Ready to Roll"
							/>
							<DashboardSection className="columns-2" dogs={sortByName(dogHash.chosen.needsWC)} hashKey="needsWC" mode={mode} title="Needs Well Check" />
						</div>
					)}

					{mode === DashboardMode.FTA && (
						<DashboardSection canHide={canHide} className="tv:[zoom:1.5] columns-5" dogs={sortByName(dogHash.fta)} hashKey="fta" mode={mode} />
					)}
				</div>
			</div>
			{showDebug && <DashboardDebugOverlay dashboardUser={session.dashboardUser} />}
		</FullWidthPage>
	)
}

function RefreshStatus({ failed, isRefreshing, lastUpdated }: { failed: boolean; isRefreshing: boolean; lastUpdated?: string }) {
	if (isRefreshing) {
		return <span className="text-sm text-[#6b7280]">Refreshing...</span>
	}
	if (!lastUpdated) {
		return null
	}

	const time = new DateTime(lastUpdated).GetTimeOnly()
	return failed ? (
		<span className="text-sm text-[#b91c1c]">Update failed. Showing data from {time}.</span>
	) : (
		<span className="text-sm text-[#6b7280]">Updated {time}</span>
	)
}

// Mirrors the Chosen Board's HeartwormButton: the badge marks a hidden dog, and on hover previews what a click does.
function HideButton({ dog }: { dog: DashboardDog }) {
	const hidden = !!dog.hidden
	const [hovered, setHovered] = useState(false)

	async function handleClick() {
		const saved = await useDashboardsState.getState().setDogHidden(dog.ID, !hidden)
		if (!saved) {
			showToast({ level: MessageLevel.Error, message: `Could not ${hidden ? "show" : "hide"} ${dog.name}. Please try again.` })
		}
	}

	const overlayIcon = hovered ? (hidden ? faXmark : faPlus) : hidden ? faPlus : undefined

	const badgeClass = hovered ? (hidden ? "bg-red-600" : "bg-green-600") : "bg-green-600"

	return (
		<CardActionAreYouSure
			icon={faEyeSlash}
			modalTitle={hidden ? "Show on dashboard" : "Hide from dashboard"}
			overlayClassName={badgeClass}
			overlayIcon={overlayIcon}
			youWantTo={hidden ? `show ${dog.name} to all dashboard viewers` : `hide ${dog.name} from non-admin dashboard viewers`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onSubmit={handleClick}
		/>
	)
}

function DashboardSection({
	canHide = false,
	className,
	hashKey,
	title,
	dogs,
	mode,
}: {
	canHide?: boolean
	className?: string
	hashKey: DashboardDogHashKey
	title?: string
	dogs: DashboardDog[]
	mode: DashboardMode
}) {
	// The server already withholds hidden dogs from non-admins; this also covers data persisted from an admin session.
	const shownDogs = canHide ? dogs : dogs.filter((dog) => !dog.hidden)
	const visibleCount = shownDogs.filter((dog) => !dog.hidden).length
	const hiddenCount = shownDogs.length - visibleCount

	return (
		<div className="mx-3 flex flex-col gap-2">
			{title && <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>}
			<h3 className="text-xl font-normal text-gray-700 uppercase">
				Total: {visibleCount} {visibleCount == 1 ? "dog" : "dogs"}
				{hiddenCount > 0 && <span className="text-[#6b7280]"> ({hiddenCount} hidden)</span>}
			</h3>
			{shownDogs.length > 0 && (
				<ul className={className ?? "flex flex-col gap-1"}>
					{shownDogs.map((dog, i) => (
						<li className={`mb-1 break-inside-avoid border-2 px-3 py-2 ${getDogCardColor(dog, hashKey, mode)} ${dog.hidden ? "opacity-50" : ""}`} key={i}>
							<div className="flex flex-row items-center gap-2">
								<img className="my-1 ml-1 aspect-square w-14 shrink-0 rounded-full" src={dog.photoURL} />
								<span className="mr-1 text-lg font-medium uppercase">{dog.name}</span>
								{canHide && <HideButton dog={dog} />}
								{/* Weekday text too, so the grouping still reads if the monitor washes out the colors. */}
								{showsWeekday(dog, hashKey, mode) && (
									<span className="mr-1 ml-auto shrink-0 text-sm font-semibold uppercase">
										{DateTime.FromISODate(dog.unavailableDate).GetWeekdayShortStr()}
									</span>
								)}
								{showsPaperworkAppointment(dog, hashKey, mode) && (
									<span className="mr-1 ml-auto shrink-0 text-sm font-semibold uppercase">
										{new DateTime(dog.paperworkAppointmentInst!).GetWeekdayShortTime()}
									</span>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
