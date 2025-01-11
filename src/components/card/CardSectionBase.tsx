import { CardSectionProps } from "./CardSection"

export function CardSectionBase(props: CardSectionProps): JSX.Element {
    const { children, showBorder } = props

    return <div className={`card-section ${showBorder ? "border" : null}`}>
        {children}
    </div>
}