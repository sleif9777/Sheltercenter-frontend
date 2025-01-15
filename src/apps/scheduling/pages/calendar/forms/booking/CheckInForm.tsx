import { TextField } from "@mui/material"
import { useState } from "react"
import { useStore } from "zustand"

import ModalWithButton from "../../../../../../components/modals/ModalWithButton"
import { useSessionState } from "../../../../../../session/SessionState"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { Appointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"

interface CheckInFormProps {
    appointment: Appointment,
    extendOnSubmit?: () => any,
    launchBtnLabel: string | JSX.Element
}

export function CheckInForm(props: CheckInFormProps) {
    const { appointment, extendOnSubmit, launchBtnLabel } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    const [clothingDescription, setClothingDescription] = useState<string>() // TODO: ENUM
    const [counselor, setCounselor] = useState<string>()

    const setDefaults = () => {
        setClothingDescription(undefined)
        setCounselor(undefined)
    }

    const validate = () => {
        return clothingDescription != undefined && 
            counselor != undefined
    }

    const handleSubmit = async () => {
        if (!validate()) {
            return
        }

        const data = {
            clothingDescription: clothingDescription,
            counselor: counselor,
            appointmentID: appointment.id,
        }

        await new AppointmentsAPI().CheckInAppointment(data)

        store.refresh(store.viewDate, [], session.userID!)

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    if (!appointment.getCurrentBooking() || appointment.checkInTime) {
        return <></>
    }

    return <ModalWithButton 
        buttonClass={"grey-card-link"} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => setDefaults()}
        extendOnOpen={() => {}}
        launchBtnLabel={launchBtnLabel}
        buttonId={`checkin-appt-${appointment.id}`}
        modalTitle="Check In"
        tooltipText="Check In"
        submitBtnLabel="Check In"
    >
        <div className="form-content">
            <TextField
                id="outlined-controlled"
                label="Clothing Description"
                margin="dense"
                maxRows={4}
                fullWidth
                style={{marginRight: 5}}
                value={clothingDescription}
                error={
                    clothingDescription != undefined && 
                    (
                        clothingDescription.length == 0 || 
                        clothingDescription.length > 200
                    )
                }
                onChange={(e) => setClothingDescription(e.target.value)}
            />
            <TextField
                id="outlined-controlled"
                label="Counselor"
                margin="dense"
                maxRows={4}
                fullWidth
                style={{marginRight: 5}}
                value={counselor}
                error={
                    counselor != undefined && 
                    (
                        counselor.length == 0 || 
                        counselor.length > 200
                    )
                }
                onChange={(e) => setCounselor(e.target.value)}
            />
        </div>
    </ModalWithButton>
}