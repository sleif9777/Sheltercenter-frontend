import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { ModalWithButtonProps } from "../modals/ModalWithButton"
import { TwoColumnList, TwoColumnListItem } from "../two_column_list/TwoColumnList"
import "./Card.scss"
import { CardActionButtonProps } from "./CardActionButton"
import { CardColor } from "./CardEnums"
import { CardItem } from "./CardItem"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export type StandardCardActions = React.ReactElement<CardActionButtonProps | ModalWithButtonProps>[]

interface StandardCardProps {
    actions?: StandardCardActions,
    className?: string,
    color: CardColor,
    children?: JSX.Element | null | (JSX.Element | null)[],
    description?: string | JSX.Element,
    topDetails?: TwoColumnListItem[],
    topIcon?: IconDefinition
}

interface PhotoCardProps extends StandardCardProps {
    photoPath: string,
}

export function StandardCard(props: StandardCardProps) {
    const { 
        actions, 
        className, 
        color, 
        children, 
        description, 
        topDetails, 
        topIcon,
    } = props

    const childrenAsArray = Array.isArray(children) ? children : [children]
    const renderableChildren = childrenAsArray ? childrenAsArray.filter(c => c != null) : []

    return <div className={`card ${className ?? ""} ${color}`}>
        <table className={renderableChildren.length > 0 ? "border" : ""}>
            <tr>
                <td className="description">
                    {topIcon ? <FontAwesomeIcon icon={topIcon} /> : <></>} {description}
                </td>
                <td className="actions">
                    {actions?.map(action => action)}
                </td>
            </tr>
            {topDetails 
                ? <TwoColumnList 
                    data={topDetails} 
                    itemRender={item => <CardItem text={item.text} />} 
                /> 
                : null}
        </table>
        {children}
    </div>
}

export function PhotoCard(props: PhotoCardProps) {
    const { 
        actions, 
        className, 
        color, 
        children, 
        description, 
        photoPath,
        topDetails, 
    } = props
    var elemTopDetails: JSX.Element | null = null

    if (topDetails) {
        elemTopDetails = <TwoColumnList 
            data={topDetails} 
            itemRender={item => <CardItem text={item.text} />} 
        /> 
    }

    const childrenAsArray = Array.isArray(children) ? children : [children]
    const renderableChildren = childrenAsArray ? childrenAsArray.filter(c => c != null) : []

    return <div className={`card photo-card ${className ?? ""} ${color}`}>
        <table>
            <tr>
                <td id="photo-cell">
                    <img src={photoPath} />
                </td>
                <td>
                    <table className={renderableChildren.length > 0 ? "border" : ""}>
                        <tr>
                            <td className="description">
                                {description}
                            </td>
                            <td className="actions">
                                {actions?.map(action => action)}
                            </td>
                        </tr>
                        {elemTopDetails}
                    </table>
                    {children}
                </td>
            </tr>
        </table>
    </div>
}

