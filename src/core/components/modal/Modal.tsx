import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"

export interface ModalState {
	isOpen: boolean
	open: () => void
	close: () => void
	toggle: () => void
	setIsOpen: (o: boolean) => void
}

export function useModalState(initial = false): ModalState {
	const [isOpen, setIsOpen] = useState(initial)

	const open = useCallback(() => {
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	const toggle = useCallback(() => {
		setIsOpen((v) => !v)
	}, [])

	return {
		close,
		isOpen,
		open,
		setIsOpen,
		toggle,
	}
}

export interface ModalProps {
	children: ReactNode
	modalState: ModalState
	modalTitle?: string
	preventCloseBeforeComplete?: boolean
}

const FOCUSABLE = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(", ")

export function Modal({ children, modalState, modalTitle, preventCloseBeforeComplete }: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const titleId = modalTitle ? "modal-title" : undefined

	// Close on ESC key
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				modalState.close()
			}
		}

		if (modalState.isOpen && !preventCloseBeforeComplete) {
			window.addEventListener("keydown", onKey)
		}

		return () => window.removeEventListener("keydown", onKey)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalState.isOpen, modalState.close])

	// Focus trap: move focus into modal on open, restore on close
	useEffect(() => {
		if (!modalState.isOpen) return

		const previousFocus = document.activeElement as HTMLElement | null

		const panel = panelRef.current
		if (panel) {
			const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
			focusable[0]?.focus()
		}

		return () => {
			previousFocus?.focus()
		}
	}, [modalState.isOpen])

	// Trap Tab/Shift+Tab within the modal
	useEffect(() => {
		if (!modalState.isOpen) return

		function onTab(e: KeyboardEvent) {
			if (e.key !== "Tab") return
			const panel = panelRef.current
			if (!panel) return

			const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
			if (focusable.length === 0) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault()
					last.focus()
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault()
					first.focus()
				}
			}
		}

		window.addEventListener("keydown", onTab)
		return () => window.removeEventListener("keydown", onTab)
	}, [modalState.isOpen])

	if (!modalState.isOpen) {
		return null
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			{/* Backdrop click */}
			{!preventCloseBeforeComplete && (
				<div aria-hidden="true" className="absolute inset-0" onClick={modalState.close} />
			)}

			{/* Modal panel */}
			<div
				ref={panelRef}
				aria-labelledby={titleId}
				aria-modal="true"
				className="font-lato relative z-10 flex max-h-[90%] w-[65%] max-w-[90%] min-w-sm flex-col border-2 border-black bg-white p-4 shadow-2xl"
				role="dialog"
			>
				{/* Header */}
				<div className="mb-3 flex items-center justify-between border-b border-pink-700">
					{modalTitle && (
						<h3 className="text-xl font-medium text-pink-700 uppercase" id="modal-title">
							{modalTitle}
						</h3>
					)}
					{!preventCloseBeforeComplete && (
						<button
							aria-label="Close"
							className="rounded-sm px-1 text-pink-700 hover:cursor-pointer hover:bg-pink-200"
							onClick={modalState.close}
						>
							<FontAwesomeIcon icon={faXmark} size="lg" />
						</button>
					)}
				</div>
				{/* Body */}
				<div className="flex min-h-0 flex-1">{children}</div>
			</div>
		</div>
	)
}
