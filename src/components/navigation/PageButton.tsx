import "./PageButton.scss"

export interface PageButtonProps {
    caption: string;
    extendOnClick?: () => void;
    route?: string;
    target?: ATagTarget;
    isLast?: boolean
}

export type ATagTarget = "_blank" | "_parent" | "_self" | "_top"

export default function PageButton(props: PageButtonProps) {
    const { caption, extendOnClick, route, target, isLast } = props

    return <div className={`navbar-element page-button ${isLast ? "no-border" : ""}`}>
        <a 
            href={route}
            onClick={() => {
                if (extendOnClick) {
                    extendOnClick()
                }
            }}
            target={target}
        >
            {caption}
        </a>
    </div>
}