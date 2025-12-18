import { faPencil, faSave, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextField } from '@mui/material';
import * as EmailValidator from 'email-validator';
import { useState } from 'react';

import { UserProfilesAPI } from '../../../../login/api/API';

interface UpdateEmailFormProps {
    emailKey: string,
}

export function UpdateEmailForm(props: UpdateEmailFormProps) {
    const { emailKey } = props

    const [email, setEmail] = useState<string>(emailKey)
    const [fieldLocked, setFieldLocked] = useState<boolean>(true)
    const [icon, setIcon] = useState<IconDefinition>(faPencil)

    const validate = () => {
        return email.length > 0 && !EmailValidator.validate(email)
    }

    async function handleSubmit() {
        validate()
        
        const data = {
            emailKey: emailKey,
            newEmail: email,
        }

        await new UserProfilesAPI().UpdatePrimaryEmail(data)
    }

    return <div className="form-content">
        <TextField
            id="outlined-controlled"
            label="Email Address"
            style={{width: 400}}
            margin="dense"
            disabled={fieldLocked}
            value={email}
            error={email.length > 0 && !EmailValidator.validate(email)}
            onChange={(e) => setEmail(e.target.value)}
        />
        <span 
            onClick={() => {
                setFieldLocked(!fieldLocked)

                if (icon === faPencil) {
                    setIcon(faSave)
                } else {
                    handleSubmit()
                    setIcon(faPencil)
                }
            }}
        >
            <FontAwesomeIcon icon={icon} />
        </span>
    </div>
}