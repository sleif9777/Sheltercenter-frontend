import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useEffect, useState } from "react"

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

export function Modal({ children, modalState, modalTitle, preventCloseBeforeComplete }: ModalProps) {
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

	if (!modalState.isOpen) {
		return null
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			{/* Backdrop click */}
			{!preventCloseBeforeComplete && <div className="absolute inset-0" onClick={modalState.close} />}

			{/* Modal panel */}
			<div className="font-lato relative z-10 flex max-h-[90%] w-[65%] max-w-[90%] min-w-sm flex-col border-2 border-black bg-white p-4 shadow-2xl">
				{/* Header */}
				<div className="mb-3 flex items-center justify-between border-b border-pink-700">
					{modalTitle && <h3 className="text-xl font-medium text-pink-700 uppercase">{modalTitle}</h3>}
					{!preventCloseBeforeComplete && (
						<button
							className="rounded-sm px-1 text-pink-700 hover:cursor-pointer hover:bg-pink-200"
							onClick={modalState.close}
						>
							<FontAwesomeIcon icon={faXmark} size="lg" />
						</button>
					)}
				</div>
				{/* Body */}
				{/* Body */}
				<div className="flex min-h-0 flex-1">{children}</div>
			</div>
		</div>
	)
}
