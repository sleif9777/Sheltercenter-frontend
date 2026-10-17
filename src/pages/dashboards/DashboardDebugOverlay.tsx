import { useEffect, useState } from "react"

import { getDashboardScroller } from "./dashboardScroller"

// Temporary: open /dashboards/?debug=1 on a monitor to see what that Silk build supports and matches.
const QUERIES: [string, string][] = [
	["md breakpoint (range syntax)", "(width >= 48rem)"],
	["md breakpoint (min-width)", "(min-width: 48rem)"],
	["Old tv query", "(pointer: coarse) and (hover: hover)"],
	["App.scss 1-column query", "only screen and ((pointer: none) or (pointer: coarse)) and (max-device-width: 1024px)"],
]

function readDiagnostics(dashboardUser: boolean): [string, string][] {
	const scroller = getDashboardScroller()
	return [
		["User agent", navigator.userAgent],
		["Viewport", `${window.innerWidth} x ${window.innerHeight} @ ${window.devicePixelRatio}x`],
		["Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone],
		["oklch colors", String(typeof CSS !== "undefined" && CSS.supports("color", "oklch(0 0 0)"))],
		...QUERIES.map(([label, query]): [string, string] => [label, String(window.matchMedia(query).matches)]),
		["Scroller", scroller ? scroller.id || scroller.tagName.toLowerCase() : "none"],
		["Scroll position", scroller ? `${scroller.scrollTop.toFixed(1)} / ${scroller.scrollHeight - scroller.clientHeight}` : "n/a"],
		["Dashboard login", String(dashboardUser)],
		["Visibility", document.visibilityState],
		["Wake lock API", String("wakeLock" in navigator)],
	]
}

export default function DashboardDebugOverlay({ dashboardUser }: { dashboardUser: boolean }) {
	const [rows, setRows] = useState(() => readDiagnostics(dashboardUser))

	useEffect(() => {
		const interval = setInterval(() => setRows(readDiagnostics(dashboardUser)), 1000)
		return () => clearInterval(interval)
	}, [dashboardUser])

	// Inline colors so the panel renders even where Tailwind's oklch theme colors don't.
	return (
		<div className="fixed bottom-2 left-2 z-50 max-w-[60vw] p-2 text-left text-xs" style={{ background: "rgba(0, 0, 0, 0.85)", color: "#ffffff" }}>
			{rows.map(([label, value]) => (
				<div key={label}>
					<strong>{label}:</strong> {value}
				</div>
			))}
		</div>
	)
}
