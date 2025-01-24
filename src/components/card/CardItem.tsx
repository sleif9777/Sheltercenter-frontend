import { TwoColumnListItem } from "../two_column_list/TwoColumnList"

// export interface CardItemProps extends TwoColumnListItem {
//     link?: string, // Mutually exclusive with modal
//     modal?: JSX.Element, // Mutually exclusive with link
// }

export function CardItem(props: TwoColumnListItem) {
    const { link, text, onClick } = props

    if (link) {
        return <li>
            <a onClick={onClick} href={link}>{text}</a>
        </li>
    }

    return <li>{text}</li>
}