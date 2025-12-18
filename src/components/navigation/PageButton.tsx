import "./PageButton.scss"

export interface PageButtonProps {
    caption: string;
    extendOnClick?: () => void;
    route?: string;
    target?: ATagTarget;
    isLast?: boolean;
    mobileSupported?: boolean;
}

export type ATagTarget = "_blank" | "_parent" | "_self" | "_top"

export default function PageButton(props: PageButtonProps) {
    const { caption, extendOnClick, route, target, isLast, mobileSupported } = props

    return <div className={`navbar-element page-button ${mobileSupported ? "" : "desktop-only"} ${isLast ? "no-border" : ""}`}>
        <a 
            href={route}
            onClick={() => {
                if (extendOnClick) {
                    extendOnClick()
                }
            }}
            target={target}
        >
            <span className="button-text">{caption}</span>
        </a>
    </div>
}