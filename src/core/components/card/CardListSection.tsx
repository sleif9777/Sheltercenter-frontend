import { ReactNode } from "react"

export interface TwoColumnListProps {
	data: TwoColumnListItem[]
	itemRender: (item: CardItemProps) => ReactNode
	showBorder?: boolean
}

export type TwoColumnListText = TwoColumnListItemBase
export type TwoColumnListLink = TwoColumnListItemBase & TwoColumnListLinkProps
export type TwoColumnListModal = TwoColumnListItemBase & TwoColumnListModalProps
export type TwoColumnListItem = TwoColumnListText | TwoColumnListLink | TwoColumnListModal

export interface TwoColumnListItemBase {
	text: string | null | undefined
	onClick?: () => void
}

export interface TwoColumnListLinkProps {
	link: string
}

export interface TwoColumnListModalProps {
	modal?: ReactNode // fragment with modal + launch button
}

// TODO: find better home
export type Defined<T> = T extends undefined | null ? never : T

function isDefinedNode<T>(item: CardItem<T>): item is CardItem<Defined<T>> {
	return item.node !== undefined && item.node !== null
}

function splitItemsIntoColumns(items: CardItem<ReactNode>[]) {
	const definedItems = items.filter((i) => isDefinedNode(i) && (i.showIf ?? true))

	const ceil = Math.ceil(definedItems.length / 2)
	const leftHalf = definedItems.slice(0, ceil)
	const rightHalf = definedItems.slice(ceil)

	return { leftHalf, rightHalf }
}

export function TwoColumnList({ items }: { items: CardItem<ReactNode>[] }) {
	const { leftHalf, rightHalf } = splitItemsIntoColumns(items)

	return (
		<div className="flex flex-row text-[14px] sm:flex-col lg:flex-row">
			<div className="w-[50%] text-left">
				{leftHalf.map((item, i) => (
					<div className="whitespace-nowrap" key={i}>
						{item.node}
					</div>
				))}
			</div>
			<div className="w-[50%] text-right sm:text-left lg:text-right">
				{rightHalf.map((item, i) => (
					<div className="wrap-normal" key={i}>
						{item.node}
					</div>
				))}
			</div>
		</div>
	)
}

interface CardItemProps extends TwoColumnListItemBase {
	className?: string
}

export interface CardItem<T> {
	node: T
	showIf?: boolean
}

export function CardListSection({
	showBorder,
	title,
	items,
}: {
	showBorder?: boolean
	items: CardItem<ReactNode>[]
	title?: string
}) {
	return (
		<div className={"flex w-full flex-col " + (showBorder ? "border-b" : "")}>
			<span className="text-left text-lg font-medium whitespace-nowrap">{title}</span>
			<TwoColumnList items={items} />
		</div>
	)
}
