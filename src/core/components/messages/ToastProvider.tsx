import { ReactNode } from "react"
import { toast, ToastContainer, Zoom } from "react-toastify"

import { MessageLevel } from "./Message"

export interface ToastProps {
	level: MessageLevel
	message: ReactNode
}

export function showToast({ level, message }: ToastProps) {
	switch (level) {
		case MessageLevel.Success:
			toast.success(message)
			break
		case MessageLevel.Warning:
			toast.warn(message)
			break
		case MessageLevel.Error:
			toast.error(message)
			break
		default:
			toast.info(message)
	}
}

export function ToastProvider() {
	return (
		<ToastContainer
			autoClose={2500}
			closeOnClick
			draggable
			newestOnTop
			pauseOnFocusLoss
			pauseOnHover
			position="bottom-right"
			theme="light"
			transition={Zoom}
		/>
	)
}
