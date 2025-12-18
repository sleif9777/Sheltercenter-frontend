export interface ParagraphWithHeaderProps {
    title: string,
    paragraph: string,
    hide?: boolean,
}

export function ParagraphWithHeader(props: ParagraphWithHeaderProps) {
    const { title, paragraph, hide } = props

    if (!hide) {
        return <div>
            <h3>{title}</h3>
            <p>
                {paragraph}
            </p>
        </div>
    }
}