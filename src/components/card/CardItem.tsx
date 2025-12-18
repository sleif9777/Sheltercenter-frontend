import { TwoColumnListItem } from "../two_column_list/TwoColumnList"

export interface CardItemProps extends TwoColumnListItem {
    className?: string
}

export function CardItem(props: CardItemProps) {
    const { link, text, onClick, className } = props

    if (link) {
        return <li className={className ?? ""}>
            <a onClick={onClick} href={link}>{text}</a>
        </li>
    }

    return <li className={className ?? ""}>{text}</li>
}