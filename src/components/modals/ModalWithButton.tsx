import { Box, Modal } from "@mui/material"
import { useState } from "react"

import "./ModalWithButton.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { Tooltip } from "react-tooltip"
import { SubmissionButton } from "../forms/SubmissionButton"

export interface ModalProps {
    canSubmit?: () => boolean,
    extendOnClose?: (param?: any) => void
    extendOnOpen?: () => void,
    extendOnSubmit?: () => any,
    children?: JSX.Element | JSX.Element[],
    modalTitle: string,
}

export interface ModalWithButtonProps extends ModalProps {
    buttonClass: string,
    buttonIcon?: IconDefinition,
    buttonId: string,
    cancelBtnLabel?: string,
    launchBtnLabel: JSX.Element | string,
    submitBtnLabel?: string,
    tooltipText?: string,
}

export default function ModalWithButton(props: ModalWithButtonProps) {
    const { 
        buttonClass, 
        buttonIcon,
        buttonId, 
        canSubmit, 
        cancelBtnLabel,
        extendOnClose, 
        extendOnOpen,
        extendOnSubmit, 
        launchBtnLabel, 
        modalTitle,
        submitBtnLabel,
        tooltipText,
        children 
    } = props
    const [open, setOpen] = useState<boolean>(false)
    const handleOpen = () => {
        if (extendOnOpen) {
            extendOnOpen()
        }

        setOpen(true)
    }
    const handleClose = () => {
        if (extendOnClose) {
            extendOnClose()
        }

        setOpen(false)
    }

    return <>        
        <button 
            className={`${buttonClass} launch-button`} 
            id={`${buttonId}-button`}
            data-tooltip-id={buttonId}
            onClick={handleOpen}
        >
            {buttonIcon 
                ? <FontAwesomeIcon 
                    className="icon" 
                    icon={buttonIcon} 
                /> 
                : null}
            {launchBtnLabel}
        </button>
        {tooltipText 
            ? <Tooltip 
                anchorSelect={`#${buttonId}-button`} 
                id={buttonId}
                content={tooltipText}
                place="bottom-start"
            />
            : null}
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className="modal">
                <div className="header">
                    <button 
                        className="close-button"
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                    {modalTitle ? <h3 className="title">{modalTitle}</h3> : null}
                </div>
                {children}
                <SubmissionButton 
                    disabled={canSubmit ? !canSubmit() : false}
                    hideIfDisabled={true}
                    extendOnSubmit={() => {
                        if (extendOnSubmit) {
                            extendOnSubmit()
                        }
                        handleClose()
                    }}
                    icon={faCheck}
                    textOverride={submitBtnLabel ?? undefined}
                /> 
                <SubmissionButton 
                    classOverride="cancel-button"
                    disabled={false}
                    extendOnSubmit={() => {
                        handleClose()
                    }}
                    icon={faXmark}
                    textOverride={cancelBtnLabel ?? "Cancel"}
                />
            </Box>
        </Modal>
    </>

}