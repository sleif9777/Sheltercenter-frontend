import { TextField } from "@mui/material";
import { AxiosResponse } from "axios";
import * as EmailValidator from 'email-validator';
import { useState } from "react";
import { useStore } from "zustand";

import { SubmissionButton } from "../../components/forms/SubmissionButton";
import { Message, MessageLevel } from "../../components/message/Message";
import { useSessionState } from "../../session/SessionState";
import { UserProfilesAPI } from "./api/API";

import "./LoginApp.scss"

export function LoginApp() {
    const [email, setEmail] = useState<string>("")
    const [OTP, setOTP] = useState<string>("")
    const [otpGenerated, setOTPGenerated] = useState<boolean>(false)
    const [generatingOTP, setGeneratingOTP] = useState<boolean>(false)
    const [loggingIn, setLoggingIn] = useState<boolean>(false)
    const [messageLevel, setMessageLevel] = useState<MessageLevel>()
    const [message, setMessage] = useState<string>("")
    const api = new UserProfilesAPI()
    const store = useStore(useSessionState)

    const generateOTPTrigger = async () => {
        setGeneratingOTP(true)
        setMessageLevel("Default")
        setMessage("Generating passcode...")
        setTimeout(async () => {
            const intraAuthContext: AxiosResponse<{ message?: string }> = await api.GenerateOTP(email)
            setOTPGenerated(intraAuthContext.status === 202)
            setMessageLevel(intraAuthContext.status === 202 ? "Success" : "Error")
            setMessage(intraAuthContext.data.message ?? "")
            setGeneratingOTP(false)
        }, 1000)
    }

    const attemptLogInTrigger = () => {
        setLoggingIn(true)
        setMessageLevel("Default")
        setMessage("Logging in...")
        setTimeout(async () => {
            await store.attemptLogIn(email, OTP)
            setMessageLevel(store.message ? "Error" : "Default")
            setMessage(store.message ?? "")
            setLoggingIn(false)
        }, 1000)
    }

    return <div id="page-container">
        <img 
            src="https://savinggracenc.org/wp-content/uploads/2017/09/saving-grace-transparentlogo.png" 
            alt="Saving Grace logo" 
            width="213" 
            height="192" 
        />
        <h1>ShelterCenter Scheduling</h1>
        <div>
            <TextField
                id="outlined-controlled"
                label="Email Address"
                style={{width: 400}}
                margin="dense"
                value={email}
                error={email.length > 0 && !EmailValidator.validate(email)}
                onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !generatingOTP) {
                        generateOTPTrigger()
                    }
                }}
            />
        </div>
        {otpGenerated
            ? <>
                <div>
                    <TextField
                        id="outlined-controlled"
                        label="Passcode"
                        style={{width: 400}}
                        margin="dense"
                        value={OTP}
                        error={OTP.length > 0 && OTP.length !== 8}
                        onChange={(e) => setOTP(e.target.value.toLocaleUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !loggingIn) {
                                attemptLogInTrigger()
                            }
                        }}
                    />
                </div>
                <div>
                    <SubmissionButton 
                        disabled={OTP.length !== 8 || loggingIn} 
                        extendOnSubmit={() => attemptLogInTrigger()}
                        // hideIfDisabled
                        textOverride="Log In"
                    />
                </div>
            </>
            : <div>
                <SubmissionButton 
                    disabled={email.length == 0 || !EmailValidator.validate(email) || generatingOTP} 
                    extendOnSubmit={() => generateOTPTrigger()}
                    // hideIfDisabled
                    textOverride="Generate Passcode"
                />
            </div>
        }
        <div>
            <Message 
                level={messageLevel ?? "Default"} 
                message={message} 
                showMessage={message.length > 0 } 
            />
        </div>
    </div>
}