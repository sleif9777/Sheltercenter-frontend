import { TwoColumnListItem } from "../two_column_list/TwoColumnList"

export interface CardItemProps extends TwoColumnListItem {
    link?: string, // Mutually exclusive with modal
    modal?: JSX.Element, // Mutually exclusive with link
}

export function CardItem(props: CardItemProps) {
    const { text, modal, link } = props

    return <li>{text}</li>
}