import { TextField } from "@mui/material"
import { IAdopter } from "../models/Adopter"
import * as EmailValidator from 'email-validator';
import { useState } from "react";
import { SubmissionButton } from "../../../components/forms/SubmissionButton";
import AdopterStatusTriState from "./AdopterStatusTriState";
import { AdopterApprovalStatus } from "../enums/AdopterEnums";
import { AdopterAPI } from "../api/API";
import moment from "moment";
import { Message, MessageLevel } from "../../../components/message/Message";
import { AxiosResponse } from "axios";
import { UserProfilesAPI } from "../../login/api/API";
import ModalWithButton from "../../../components/modals/ModalWithButton";
import { UpdateEmailForm } from "../pages/detail/components/UpdateEmailForm";

interface AdopterFormProps {
    defaults?: IAdopter,
    extendOnSubmit?: () => any,
    context: "Upload" | "Manage"
}

export function AdopterForm(props: AdopterFormProps) {
    const { defaults, extendOnSubmit, context } = props

    const [firstName, setFirstName] = useState<string>(defaults?.firstName || "")
    const [lastName, setLastName] = useState<string>(defaults?.lastName || "")
    const [primaryEmail, setPrimaryEmail] = useState<string>(defaults?.primaryEmail || "")
    const [status, setStatus] = useState<AdopterApprovalStatus>(defaults?.status || AdopterApprovalStatus.APPROVED)
    const [internalNotes, setInternalNotes] = useState<string>(defaults?.internalNotes || "")

    const [showMessage, setShowMessage] = useState<boolean>(false)
    const [postUploadMsg, setPostUploadMsg] = useState<string | JSX.Element>("")
    const [messageLevel, setMessageLevel] = useState<MessageLevel>("Default")

    const validate = () => {
        return (firstName.length > 0) &&
            (lastName.length > 0) &&
            (primaryEmail.length > 0) &&
            (EmailValidator.validate(primaryEmail)) &&
            (status != undefined)
    }

    const handleSubmit = async () => {
        validate()

        setShowMessage(false)
        
        const data = {
            ID: 0,
            firstName: firstName,
            lastName: lastName,
            primaryEmail: primaryEmail,
            status: status,
            internalNotes: internalNotes,
            approvedUntil: defaults?.approvedUntil ?? moment().add(1, "years").toDate(),
            userID: defaults?.userID ?? 0,
            context: context
        }

        const response: AxiosResponse = await new UserProfilesAPI().SaveAdopterByForm(data)
        const adopter = response.data.adopter

        switch (response.status) {
            case 201:
                setPostUploadMsg("Adopter created")
                setMessageLevel("Success")
                break
            case 202:
                setPostUploadMsg("Adopter updated")
                setMessageLevel("Success")
                break
            case 203:
                setPostUploadMsg(<>
                    <span>Adopter was previously blocked. Review and update manually:</span>
                    <ul>
                        <li>
                            <a href={`/adopters/manage/${adopter.ID}`} target="_blank">{adopter.fullName}</a>
                        </li>
                    </ul>
                </>)
                setMessageLevel("Error")
                break
            default:
                setPostUploadMsg("Failed")
                setMessageLevel("Error")
        }

        setShowMessage(true)

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    return <form>
        <div>
            <TextField
                id="outlined-controlled"
                label="First Name"
                margin="dense"
                style={{marginRight: 5}}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
                id="outlined-controlled"
                label="Last Name"
                margin="dense"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
        </div>
        <div>
            { context === "Manage" 
                ? <UpdateEmailForm emailKey={primaryEmail} /> 
                : <TextField
                    id="outlined-controlled"
                    label="Email Address"
                    style={{width: 400}}
                    margin="dense"
                    value={primaryEmail}
                    error={primaryEmail.length > 0 && !EmailValidator.validate(primaryEmail)}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                />}
        </div>
        <div>
            <AdopterStatusTriState 
                defaultStatus={status} 
                onChange={(_, newStatus) => { setStatus(newStatus) }}
            />
        </div>
        <div>
            <TextField 
                id="outlined-controlled"
                multiline
                rows={4}
                maxRows={4}
                label="Internal Notes"
                style={{width: 400}}
                margin="dense"
                defaultValue={internalNotes}
                value={internalNotes}
                error={internalNotes.length > 500}
                onChange={(e) => setInternalNotes(e.target.value)}
            />
        </div>
        <div>
            <SubmissionButton 
                disabled={!validate()} 
                extendOnSubmit={handleSubmit} 
                textOverride="Save"
            />
            <Message level={messageLevel} message={postUploadMsg} showMessage={showMessage} />
        </div>
    </form>
}