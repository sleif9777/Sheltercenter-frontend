import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { ReactNode, useEffect, useRef, useState } from "react"

import { getCardColorClasses } from "./Card"
import { CardActionButton } from "./CardActionButton"
import { CardColor } from "./CardEnums"

export function CardActionSection({ children, color }: { children: ReactNode; color: CardColor }) {
	const [open, setOpen] = useState(false)
	const [stickyOpen, setStickyOpen] = useState(false)
	const { bg } = getCardColorClasses(color)

	const containerRef = useRef<HTMLDivElement>(null)
	const closeTimeout = useRef<number | null>(null)

	// Helpers
	const handleMouseEnter = () => {
		if (closeTimeout.current) {
			clearTimeout(closeTimeout.current)
			closeTimeout.current = null
		}
		setOpen(true)
	}

	const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
		closeTimeout.current = window.setTimeout(() => {
			// Only close if not sticky and cursor isn't over container
			if (
				!stickyOpen &&
				containerRef.current &&
				!(e.relatedTarget instanceof Node && containerRef.current.contains(e.relatedTarget))
			) {
				setOpen(false)
			}
		}, 250)
	}

	useEffect(() => {
		if (!stickyOpen) {
			return
		}

		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setStickyOpen(false)
				setOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [stickyOpen])

	return (
		<>
			{/* Inline actions for md+ */}
			<div className="hidden w-full flex-row justify-end gap-x-1.5 lg:flex">{children}</div>

			{/* Dropdown for sm and below */}
			<div className="relative flex w-full justify-end pr-1 lg:hidden">
				<div className="relative" ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
					{/* Dropdown menu */}
					{(open || stickyOpen) && (
						<div className={`${bg} absolute top-full right-0 z-20 mt-1 rounded-md border p-1 shadow-lg`}>
							<div className="flex flex-col gap-y-1.5 text-4xl sm:flex-row sm:gap-x-1.5 sm:text-xl">{children}</div>
						</div>
					)}

					{/* Ellipsis button */}
					<CardActionButton
						className="cursor-context-menu"
						primaryIcon={faEllipsis}
						primaryTooltipContent=""
						onClick={() => setStickyOpen((v) => !v)}
					/>
				</div>
			</div>
		</>
	)
}
