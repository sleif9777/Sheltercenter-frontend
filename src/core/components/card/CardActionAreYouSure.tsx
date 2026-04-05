import { IconDefinition, IconProp } from "@fortawesome/fontawesome-svg-core"

import { AreYouSure, AreYouSureProps } from "../modal/AreYouSure"
import { useModalState } from "../modal/Modal"
import { CardActionButton } from "./CardActionButton"

export function CardActionAreYouSure({
	icon,
	onMouseEnter,
	onMouseLeave,
	onSubmit,
	overlayClassName,
	overlayIcon,
	youWantTo,
	modalTitle,
}: {
	icon: IconDefinition
	onMouseEnter?: () => void
	onMouseLeave?: () => void
	overlayClassName?: string
	overlayIcon?: IconProp
} & Omit<AreYouSureProps, "modalState">) {
	const modalState = useModalState()

	return (
		<>
			<CardActionButton
				overlayClassName={overlayClassName}
				overlayIcon={overlayIcon}
				primaryIcon={icon}
				primaryTooltipContent={modalTitle}
				onClick={() => modalState.open()}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			/>
			<AreYouSure modalState={modalState} modalTitle={modalTitle} youWantTo={youWantTo} onSubmit={onSubmit} />
		</>
	)
}
