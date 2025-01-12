import { StringUtils } from "../../utils/StringUtils";

import "./TwoColumnList.scss"

export interface TwoColumnListProps {
    data: TwoColumnListItem[],
    itemRender: (item: TwoColumnListItem) => JSX.Element,
    showBorder?: boolean
}

export interface TwoColumnListItem {
    text: string | null | undefined,
    onClick?: () => void,
    link?: string, // Mutually exclusive with modal
    modal?: JSX.Element, // Mutually exclusive with link
}

export function TwoColumnList(props: TwoColumnListProps) {
    const { data, itemRender } = props

    const splitDataForTwoColList: (data: TwoColumnListItem[]) => TwoColumnListItem[][] = (data) => {
        data = data.filter(d => !StringUtils.isNullUndefinedOrEmpty(d.text))
    
        const ceil = Math.ceil(data.length / 2)
    
        const leftHalf = data.slice(0, ceil)
        const rightHalf = data.slice(ceil)
    
        return [leftHalf, rightHalf]
    }

    const columnSetup = splitDataForTwoColList(data)

    return <tr className={`two-col-list`}>
        <td>
            <ul className="left">
                {columnSetup[0].map(item => itemRender(item))}
            </ul>
        </td>
        <td>
            <ul className="right">
                {columnSetup[1]
                    .map(item => itemRender(item))}
            </ul>
        </td>
    </tr>
}