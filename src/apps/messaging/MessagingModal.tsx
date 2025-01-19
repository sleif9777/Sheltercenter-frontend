import { TextareaAutosize } from "@mui/material"
import { useState } from "react"

import ButtonGroup from "../../components/forms/fields/ButtonGroup"
import ModalWithButton, { ModalWithButtonProps } from "../../components/modals/ModalWithButton"
import { IAdopter } from "../adopters/models/Adopter"
import { IQuickText } from "./QuickText"
import { useStore } from "zustand"
import { useSessionState } from "../../session/SessionState"
import { Message } from "../../components/message/Message"

interface MessagingModalProps extends Omit<ModalWithButtonProps, "extendOnSubmit"> {
    recipient: IAdopter,
    subject: string,
    extendOnSubmit: (message: string, subject: string) => void,
    quickTexts: IQuickText[],
    allowOnlyQuickTexts: boolean,
}

export function MessagingModal(props: MessagingModalProps) {
    const { recipient, subject, extendOnSubmit, quickTexts, allowOnlyQuickTexts } = props    
    const session = useStore(useSessionState)

    const signature = (session.userFName && session.userLName)
        ? `${session.userFName} ${session.userLName}`
        : "The Adoptions Team"

    const defaultText = `Hi ${recipient.firstName},\n\n\n\nKind regards,\n${signature}\nSaving Grace Animals for Adoption`

    const [message, setMessage] = useState<string>(allowOnlyQuickTexts ? "" : defaultText)

    const validate = () => {
        return message.length > 0 || allowOnlyQuickTexts
    }

    async function handleSubmit() {
        validate()

        setMessage("")

        extendOnSubmit(message, subject)
    }

    return <ModalWithButton 
            {...props}
            canSubmit={() => validate()}
            extendOnSubmit={() => handleSubmit()}
        >
        <Message level={"Default"} showMessage={message == ""} message={"If no template is selected, the system default message will be used."} />
        <div className="form-content">
            <label htmlFor="message-body">Message</label>
            <TextareaAutosize 
                minRows={10}
                maxRows={15}
                id="message-body"
                hidden={message == ""}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value)
                }}
            />
        </div>
        <ButtonGroup
            show={true} 
            value={undefined}
            buttons={quickTexts}
            onChange={(_, newValue) => {
                const newType = quickTexts.find(qt => qt.value == newValue)
                setMessage(newType?.text ?? "")
            }} 
            labelText={""} 
            id={"quicktexts"}            
        />
    </ModalWithButton>
}