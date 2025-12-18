import { faPaw } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ModalWithButton, { ModalHeight, ModalProps } from "../../components/modals/ModalWithButton"
import "./Toolbar.scss"
import { ATagTarget } from "../../components/navigation/PageButton"

interface ToolbarElementProps {
    text: string
}

interface ToolbarLinkProps extends ToolbarElementProps {
    href: string,
    target?: ATagTarget
}

interface ToolbarButtonProps extends ToolbarElementProps {
    onClick: () => void
}

interface ToolbarModalProps extends ToolbarElementProps, ModalProps {
    height: ModalHeight
}

export function ToolbarModal(props: ToolbarModalProps) {
    const { text, canSubmit, extendOnClose, extendOnSubmit, height, children, modalTitle } = props
        
    return <ModalWithButton 
        buttonClass="toolbar-element" 
        buttonIcon={faPaw}
        buttonId={""} 
        height={height}
        launchBtnLabel={text}
        canSubmit={canSubmit}
        extendOnClose={extendOnClose}
        extendOnSubmit={extendOnSubmit}
        children={children}
        modalTitle={modalTitle} 
    />
}

export function ToolbarLink(props: ToolbarLinkProps) {
    const { text, href, target } = props

    return <ToolbarButton 
        text={text}
        onClick={() => window.open(href, target)}
    />
}

export function ToolbarButton(props: ToolbarButtonProps) {
    const { text, onClick } = props

    return <button className="toolbar-element" onClick={onClick}>
        <FontAwesomeIcon className="icon" icon={faPaw} />
        {text}
    </button>
}

export type ToolbarElement = React.ReactElement<ToolbarModalProps> | 
    React.ReactElement<ToolbarLinkProps> | 
    React.ReactElement<ToolbarButtonProps>