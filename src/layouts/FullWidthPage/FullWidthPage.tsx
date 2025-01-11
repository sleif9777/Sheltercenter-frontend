import "./FullWidthPage.scss"
import { ToolbarElement } from "../Toolbar/Toolbar"

interface FullWidthPageProps {
    children: JSX.Element | JSX.Element[],
    title: string | JSX.Element,
    subtitle?: string

    toolbarItems?: ToolbarElement[]
}

export default function FullWidthPage(props: FullWidthPageProps) {
    const { children, subtitle, title, toolbarItems } = props

    const toolbar = toolbarItems 
        ? <div className="toolbar">
            {toolbarItems?.map(item => item)}
        </div>
        : null
    
    return <div className="full-width-page">
        <h1>{title}</h1>
        {subtitle ? <h2>{subtitle}</h2> : null}
        {toolbar}
        <div className="content">
            {children}
        </div>
    </div>
}