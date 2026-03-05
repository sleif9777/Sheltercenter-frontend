import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

import { AreYouSure, AreYouSureProps } from "../modal/AreYouSure"
import { useModalState } from "../modal/Modal"
import { CardActionButton } from "./CardActionButton"

export function CardActionAreYouSure({
	icon,
	onSubmit,
	youWantTo,
	modalTitle,
}: {
	icon: IconDefinition
} & Omit<AreYouSureProps, "modalState">) {
	const modalState = useModalState()

	return (
		<>
			<CardActionButton primaryIcon={icon} primaryTooltipContent={modalTitle} onClick={() => modalState.open()} />
			<AreYouSure modalState={modalState} modalTitle={modalTitle} youWantTo={youWantTo} onSubmit={onSubmit} />
		</>
	)
}
