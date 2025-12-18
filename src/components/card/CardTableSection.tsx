import { StringUtils } from "../../utils/StringUtils"
import { CardActionButton, CardActionButtonProps } from "./CardActionButton"
import { CardSectionProps } from "./CardSection"

export interface CardTableSectionProps extends CardSectionProps {
    data: DataRow[],
    actions?: CardActionButtonProps[],
}

export interface DataRow {
    label: string,
    content?: string,
}

export function CardTableSection(props: CardTableSectionProps) {
    const { actions, data, showBorder, title } = props

    return <table className={`card-section table-section ${showBorder ? "border" : null}`}>
        <tr>
            { title ? <th className="header">{title}</th> : <></> }
            <td className="actions">
                    {actions?.map(action => <CardActionButton 
                        extendOnClick={action.extendOnClick}
                        icon={action.icon} 
                        id={action.id} 
                        toggle={action.toggle}
                        tooltipContent={action.tooltipContent} 
                        tooltipId={action.tooltipId}                         
                    />)}
                </td>
        </tr>
        {data
            .filter(row => !StringUtils.isNullUndefinedOrEmpty(row.content))
            .map(row => {
                return <tr>
                    <td className="label">{row.label}:</td>
                    <td className="row-content">{row.content}</td>
                </tr>
        })}
    </table>
}