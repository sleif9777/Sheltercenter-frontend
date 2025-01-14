import ModalWithButton from "../../../../../../components/modals/ModalWithButton"
import { useState } from "react"
import { useStore } from "zustand"
import { Appointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import ButtonGroup from "../../../../../../components/forms/fields/ButtonGroup"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { useSessionState } from "../../../../../../session/SessionState"
import { TextField } from "@mui/material"

interface CheckOutFormProps {
    appointment: Appointment,
    btnClass: string,
    extendOnSubmit?: () => any,
    launchBtnLabel: string | JSX.Element
}

export function CheckOutForm(props: CheckOutFormProps) {
    const { appointment, btnClass, extendOnSubmit, launchBtnLabel } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    const [outcome, setOutcome] = useState<number>() // TODO: ENUM
    const [dog, setDog] = useState<string>()
    const [hostWeekend, setHostWeekend] = useState<boolean>(false)

    const setDefaults = () => {
        setOutcome(appointment.outcome ?? undefined)
        setDog(appointment.sourceAdoptionDog ?? undefined)
    }

    const validate = () => {
        if (outcome === undefined) {
            return false
        }

        if (outcome < 3) {
            return !(!dog || dog.length == 0)
        } else {
            return dog == undefined
        }
    }

    const handleSubmit = async () => {
        if (!validate()) {
            return
        }

        const data = {
            outcome: outcome,
            dog: dog,
            appointmentID: appointment.id,
            hostWeekend: hostWeekend,
        }

        await new AppointmentsAPI().CheckOutAppointment(data)

        store.refresh(store.viewDate, false, session.userID!)

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    const outcomeOptions = [
        { name: "Adoption", value: 0 }, // TODO: Make this enum
        { name: "FTA", value: 1 },
        { name: "Chosen", value: 2 },
        { name: "No Decision", value: 3 },
    ]

    const hostWeekendOptions = [
        { name: "Yes", value: 1 },
        { name: "No", value: 0 },
    ]
    
    const handleOutcomeChange = (newOutcome: number | undefined) => {
        setOutcome(newOutcome)

        if (newOutcome == 3 || newOutcome == undefined) {
            setDog(undefined)
            setHostWeekend(newOutcome != undefined)
        } else {
            setHostWeekend(false)
        }
    }

    if (!appointment.getCurrentBooking()) {
        return <></>
    }

    return <ModalWithButton 
        buttonClass={btnClass} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => setDefaults()}
        extendOnOpen={() => setDefaults()}
        launchBtnLabel={launchBtnLabel}
        buttonId={`checkout-appt-${appointment.id}`}
        modalTitle="Check Out"
        tooltipText="Check Out"
    >
        <div className="form-content">
            <ButtonGroup 
                show={true} 
                value={outcome}
                buttons={outcomeOptions} 
                onChange={(_, newValue) => handleOutcomeChange(newValue)} 
                labelText={"Outcome"} 
                id={"outcome"}        
            />
            {outcome != undefined && outcome < 3 
                ? <TextField
                        id="outlined-controlled"
                        label="Dog"
                        margin="dense"
                        maxRows={4}
                        fullWidth
                        style={{marginRight: 5}}
                        value={dog}
                        error={!dog || dog.length > 100}
                        onChange={(e) => setDog(e.target.value)}
                    />
                : null}
            {outcome == 3 
                ? <ButtonGroup 
                    show={true} 
                    value={hostWeekend ? 1 : 0}
                    buttons={hostWeekendOptions} 
                    onChange={(_, newValue) => setHostWeekend(newValue == 1)} 
                    labelText={"Send information about Host Weekend?"} 
                    id={"outcome"}        
                />
                : null}
        </div>
    </ModalWithButton>
}