import "./TwoColumnPage.scss"

interface TwoColumnPageProps extends PageProps {
    leftContent: JSX.Element
    rightContent: JSX.Element
    titlePosition?: "left" | "top"
}

export default function TwoColumnPage(props: TwoColumnPageProps) {
    const { leftContent, rightContent, titlePosition, title, subtitle } = props

    const titleContent = <div className="title">
        <h1>{title}</h1>
    </div>
    
    return <div className="two-col-page">
        {title && ((titlePosition ?? "top") == "top") ? titleContent : null }
        <h4>{subtitle ?? ""}</h4>
        <div>
            <table className="content">
                <tr>
                    <td className="left">
                        {title && (titlePosition == "left") ? titleContent : null }
                        <div className="content">
                            {leftContent}
                        </div>
                    </td>
                    <td className="right">
                        <div className="content">
                            {rightContent}
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
}