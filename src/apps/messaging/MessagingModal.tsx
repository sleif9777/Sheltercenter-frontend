import { TextareaAutosize } from "@mui/material"
import { useState } from "react"

import ButtonGroup from "../../components/forms/fields/ButtonGroup"
import ModalWithButton, { ModalWithButtonProps } from "../../components/modals/ModalWithButton"
import { IAdopter } from "../adopters/models/Adopter"
import { IQuickText } from "./QuickText"

interface MessagingModalProps extends Omit<ModalWithButtonProps, "extendOnSubmit"> {
    recipient: IAdopter,
    subject: string,
    extendOnSubmit: (message: string, subject: string) => void,
    quickTexts: IQuickText[]
}

export function MessagingModal(props: MessagingModalProps) {
    const { subject, extendOnSubmit, quickTexts } = props
    const [message, setMessage] = useState<string>("")

    const validate = () => {
        return message.length > 0
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
        <div className="form-content">
            <label htmlFor="message-body">Message</label>
            <TextareaAutosize 
                minRows={10}
                maxRows={15}
                id="message-body"
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