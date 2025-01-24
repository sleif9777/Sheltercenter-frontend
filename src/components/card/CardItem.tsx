import { TwoColumnListItem } from "../two_column_list/TwoColumnList"

export function CardItem(props: TwoColumnListItem) {
    const { link, text, onClick } = props

    if (link) {
        return <li>
            <a onClick={onClick} href={link}>{text}</a>
        </li>
    }

    return <li>{text}</li>
}