import { TwoColumnList, TwoColumnListItem } from "../two_column_list/TwoColumnList";
import { CardItem } from "./CardItem";
import { CardSectionProps } from "./CardSection";

export interface CardListItemSectionProps extends CardSectionProps {
    data: TwoColumnListItem[],
}

export function CardItemListSection(props: CardListItemSectionProps) {
    const { data, showBorder, title } = props

    return <table className={`card-section ${showBorder ? "border" : null}`}>
        <tr>
            { title ? <th className="header" colSpan={2}>{title}</th> : <></> }
        </tr>
        <TwoColumnList 
            data={data} 
            itemRender={item => {
                return <CardItem text={item.text} link={item.elementID} />
            }} 
        />
    </table>
}

