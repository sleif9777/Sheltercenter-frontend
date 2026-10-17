// #main-content only scrolls when App's `md:` classes apply. Tailwind v4 compiles those to range media queries
// (`width >= 48rem`), which older Silk builds ignore; the document scrolls instead, so fall back to it.
export function getDashboardScroller(): HTMLElement | null {
	const main = document.getElementById("main-content")
	if (main) {
		const overflowY = getComputedStyle(main).overflowY
		if (overflowY === "auto" || overflowY === "scroll") {
			return main
		}
	}
	return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}
