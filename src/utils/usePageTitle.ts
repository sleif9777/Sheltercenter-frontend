import { useEffect } from "react"

const BASE_TITLE = "Saving Grace Scheduler"

export function usePageTitle(title: string): void {
	useEffect(() => {
		document.title = `${title} — ${BASE_TITLE}`
		return () => {
			document.title = BASE_TITLE
		}
	}, [title])
}
