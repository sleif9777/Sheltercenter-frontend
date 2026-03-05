import { faPaw } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { AreYouSureProps } from "../../core/components/modal/AreYouSure"
import { ModalProps } from "../../core/components/modal/Modal"

interface ToolbarElementProps {
	text: string
}

interface ToolbarLinkProps extends ToolbarElementProps {
	href: string
	target?: string
}

interface ToolbarButtonProps extends ToolbarElementProps {
	onClick: () => void
}

interface ToolbarModalProps extends ToolbarElementProps {
	modal: React.ReactElement<ModalProps>
}

interface ToolbarAreYouSureProps extends ToolbarElementProps {
	areYouSure: React.ReactElement<AreYouSureProps>
}

export function ToolbarLink(props: ToolbarLinkProps) {
	const { text, href, target } = props

	return <ToolbarButton text={text} onClick={() => window.open(href, target)} />
}

export function ToolbarButton(props: ToolbarButtonProps) {
	const { text, onClick } = props

	return (
		<button
			className="w-full rounded-md p-1 font-normal whitespace-nowrap last:col-span-2 hover:cursor-pointer hover:bg-pink-200 sm:w-auto"
			onClick={onClick}
		>
			<FontAwesomeIcon className="mx-1" icon={faPaw} />
			{text}
		</button>
	)
}

export function ToolbarModal({ text, modal }: ToolbarModalProps) {
	return (
		<>
			<ToolbarButton text={text} onClick={modal.props.modalState.open} />
			{modal}
		</>
	)
}

export function ToolbarAreYouSure({ text, areYouSure }: ToolbarAreYouSureProps) {
	return (
		<>
			<ToolbarButton text={text} onClick={areYouSure.props.modalState.open} />
			{areYouSure}
		</>
	)
}

export type ToolbarElement =
	| React.ReactElement<ToolbarLinkProps>
	| React.ReactElement<ToolbarButtonProps>
	| React.ReactElement<ToolbarModalProps>
	| React.ReactElement<ToolbarAreYouSureProps>

export function Toolbar({ children }: { children: ToolbarElement[] }) {
	const isOdd = children.length % 2 !== 0

	return (
		<div className="mx-auto mb-2 grid grid-cols-2 items-center justify-center gap-x-3 gap-y-1 sm:flex sm:flex-row sm:flex-wrap">
			{children.map((child, i) => (
				<div className={isOdd && i === children.length - 1 ? "col-span-2" : ""} key={i}>
					{child}
				</div>
			))}
		</div>
	)
}
