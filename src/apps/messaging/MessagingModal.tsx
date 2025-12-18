import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { TextareaAutosize } from "@mui/material"
import { useState } from "react"
import { useStore } from "zustand"

import ButtonGroup from "../../components/forms/fields/ButtonGroup"
import { Message } from "../../components/message/Message"
import ModalWithButton, { ModalWithButtonProps } from "../../components/modals/ModalWithButton"
import { useSessionState } from "../../session/SessionState"
import { IAdopter } from "../adopters/models/Adopter"
import { IQuickText } from "./QuickText"

interface MessagingModalProps extends Omit<ModalWithButtonProps, "extendOnSubmit" | "height"> {
    recipient: IAdopter,
    subject: string,
    extendOnSubmit: (message: string, subject: string, templateID: number) => void,
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
    const [templateID, setTemplateID] = useState<number>(-1)

    const validate = () => {
        return (message.length > 0 || allowOnlyQuickTexts) && !message.includes("$$$")
    }

    async function handleSubmit() {
        validate()

        setMessage(defaultText)

        extendOnSubmit(message, subject, templateID)
        quickTexts.find(qt => qt.value == templateID)!.sent = true
    }

    return <ModalWithButton 
            {...props}
            height={"70%"}
            canSubmit={() => validate()}
            extendOnSubmit={() => handleSubmit()}
        >
        <Message level={"Default"} showMessage={message == ""} message={"If no template is selected, the system default message will be used."} />
        <table>
            <tr>
                <td style={{ verticalAlign: "top", paddingTop: 15, paddingRight: 5 }}>
                    <div>
                        <ButtonGroup
                            show={quickTexts.filter(qt => !qt.sent).length > 0} 
                            singleColumn
                            value={undefined}
                            buttons={quickTexts.filter(qt => !qt.sent)}
                            onChange={(_, newValue) => {
                                const newType = quickTexts.find(qt => qt.value == newValue)
                                if (newType) {
                                    setMessage(newType.text)
                                    setTemplateID(newType.value)
                                }
                            }} 
                            labelText={""} 
                            id={"quicktexts"}            
                        />
                    </div>
                    {quickTexts.filter(qt => qt.sent).length > 0 && <div>
                        <b>Already sent:</b>
                        <ul style={{ paddingLeft: 10, fontSize: 12, listStyleType: "none" }}>
                            {quickTexts.filter(qt => qt.sent).map(qt => <li style={{ textDecoration: "line-through" }}>
                                    <FontAwesomeIcon style={{ marginRight: 3 }} icon={faCheck} /> {qt.name}
                                </li>)}
                        </ul>
                    </div>}
                </td>
            </tr>
            <tr>
                <td>
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
                </td>
            </tr>
        </table>
        <Message level={"Error"} showMessage={message.includes("$$$")} message={"Fix all fill-in-the-blanks ($$$)."} />
    </ModalWithButton>
}