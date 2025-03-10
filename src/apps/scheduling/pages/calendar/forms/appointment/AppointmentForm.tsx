import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import moment from "moment"
import { useState } from "react"
import { useStore } from "zustand"

import ButtonGroup from "../../../../../../components/forms/fields/ButtonGroup"
import { CheckboxField } from "../../../../../../components/forms/fields/CheckboxField"
import { TimeField } from "../../../../../../components/forms/fields/TimeField"
import ModalWithButton from "../../../../../../components/modals/ModalWithButton"
import { SecurityLevel } from "../../../../../../session/SecurityLevel"
import { useSessionState } from "../../../../../../session/SessionState"
import { IPendingAdoption } from "../../../../../pending_adoptions/models/PendingAdoption"
import { AppointmentType } from "../../../../enums/Enums"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { IAppointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import { AppointmentTypeFunctions } from "../../../../utils/AppointmentTypeUtils"

interface AppointmentFormProps {
    defaults?: IAppointment,
    extendOnSubmit?: () => any,
    buttonClassOverride?: string,
}

export function AppointmentForm(props: AppointmentFormProps) {
    const { defaults, extendOnSubmit, buttonClassOverride } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    const date = moment(store.viewDate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .set("millisecond", 0)
    const today = moment(new Date())
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .set("millisecond", 0)

    const [type, setType] = useState<AppointmentType | undefined>(defaults?.type)
    const [instant, setInstant] = useState<Date | undefined>(defaults ? defaults.instant : undefined)
    const [locked, setLocked] = useState<boolean>(false)

    // ADMIN APPOINTMENT ONLY FIELDS
    const [notes, setNotes] = useState<string>("")
    const [surrenderedDog, setSurrenderedDog] = useState<string>("")
    const [surrenderedDogFka, setSurrenderedDogFka] = useState<string>("")
    const [paperworkAdoption, setPaperworkAdoption] = useState<IPendingAdoption>()
    
    const [showLockedField, setShowLockedField] = useState<boolean>(true)
    const [showPaperworkAdoptionField, setShowPaperworkAdoptionField] = useState<boolean>(false)
    const [showNotesField, setShowNotesField] = useState<boolean>(false)
    const [showSurrenderedDogField, setShowSurrenderedDogField] = useState<boolean>(false)
    const [showSurrenderedDogFkaField, setShowSurrenderedDogFkaField] = useState<boolean>(false)

    const [paperworkAdoptionOptions, setPaperworkAdoptionOptions] = useState<IPendingAdoption[]>([])

    const resetForm = () => {
        if (defaults) {
            setType(defaults.type)
            setInstant(defaults.instant)
            setLocked(defaults.locked)
            setNotes(defaults.appointmentNotes ?? "")
        }

        setType(undefined)
        setInstant(undefined)
        setLocked(false)
        setNotes("")
    }

    const validate = () => {
        if (type == undefined || instant == undefined) {
            return false
        }

        if (AppointmentTypeFunctions.isPaperworkAppointment(type)) {
            return paperworkAdoption != undefined
        }

        if (AppointmentTypeFunctions.isSurrenderAppointment(type)) {
            return surrenderedDog.length > 0
        }

        if (AppointmentTypeFunctions.isAdminAppointment(type)) {
            return notes.length > 0
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validate() || !instant) {
            return
        }

        const data: Omit<IAppointment, "id" | "heartwormPositive"> = {
            type: type!,
            locked: locked,
            instant: instant,
            paperworkAdoptionID: paperworkAdoption?.id,
            appointmentNotes: notes,
            surrenderedDog: surrenderedDog,
            surrenderedDogFka: surrenderedDogFka,
        }

        await new AppointmentsAPI().CreateAppointment(data)

        store.refresh(store.viewDate, [], session.userID!)

        resetForm()

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    if (date < today) {
        return <></>
    }

    if (session.securityLevel != undefined && session.securityLevel < SecurityLevel.ADMIN) {
        return <></>
    }

    function PaperworkField() {
        if (paperworkAdoptionOptions.length === 0) {
            setPaperworkAdoptionOptions(store.adoptionsSansPaperwork)
        }

        return <>
            <InputLabel id="dog">Dog</InputLabel>
            <Select
                id="dog"
                value={paperworkAdoption?.id}
                label="Adoption"
                style={{ width: 400 }}
                onChange={(e) => {
                    const newAdoption = paperworkAdoptionOptions.find(a => a.id == e.target.value)
                    setPaperworkAdoption(newAdoption)
                }}
            >
                {paperworkAdoptionOptions
                    .sort((a, b) => a.dog.localeCompare(b.dog))
                    .map(a => <MenuItem value={a.id}>
                        {a.dog} ({a.adopter.fullName})
                    </MenuItem>)
                }
            </Select><br />
        </>
    }

    return <ModalWithButton 
        buttonClass={"submit-button " + (buttonClassOverride ?? "")} 
        buttonId={"add-appointment"} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => resetForm()}
        height="60%"
        launchBtnLabel={"Add Appointment"} 
        modalTitle={"Add Appointment"}
    >
        <div className="form-content">
            <ButtonGroup
                id={"type"}
                show={true}
                labelText="Type" 
                value={type}
                onChange={(_, newType) => {
                    setType(newType)

                    if (!newType) {
                        setShowPaperworkAdoptionField(false)
                        setShowLockedField(true)
                        setShowNotesField(false)
                        setShowSurrenderedDogField(false)
                        setShowSurrenderedDogFkaField(false)

                        setPaperworkAdoption(undefined)
                        setLocked(false)
                        setNotes("")
                        setSurrenderedDog("")
                        setSurrenderedDogFka("")
                    } else {
                        const isPaperwork = AppointmentTypeFunctions.isPaperworkAppointment(newType)
                        setShowPaperworkAdoptionField(isPaperwork)
                        setPaperworkAdoption(isPaperwork ? paperworkAdoption : undefined)
                        
                        const isAdoption = AppointmentTypeFunctions.isAdoptionAppointment(newType)
                        setShowLockedField(isAdoption)
                        setLocked(isAdoption ? locked : false)

                        const isNonPaperworkAdmin = AppointmentTypeFunctions.isNonPaperworkAdminAppointment(newType)
                        setShowNotesField(isNonPaperworkAdmin)
                        setNotes(isNonPaperworkAdmin ? notes : "")

                        const isSurrender = AppointmentTypeFunctions.isSurrenderAppointment(newType)
                        setShowSurrenderedDogField(isSurrender)
                        setShowSurrenderedDogFkaField(isSurrender)
                        setSurrenderedDog(isSurrender ? surrenderedDog : "")
                        setSurrenderedDogFka(isSurrender ? surrenderedDogFka : "")
                    }
                }}
                buttons={[
                    { name: "Adults", value: AppointmentType.ADULTS },
                    { name: "Puppies", value: AppointmentType.PUPPIES },
                    { name: "All Ages", value: AppointmentType.ALL_AGES },
                    { name: "Fun-Size", value: AppointmentType.FUN_SIZE },
                    { name: "Paperwork", value: AppointmentType.PAPERWORK },
                    { name: "Surrender", value: AppointmentType.SURRENDER },
                    { name: "Visit", value: AppointmentType.VISIT },
                    { name: "Donation Drop-Off", value: AppointmentType.DONATION_DROP_OFF }
                ]}
            />
            <TimeField 
                id={"instant"} 
                labelText="Time" 
                changeTime={(e) => setInstant(e ?? undefined)} 
                defaultValue={store.viewDate}
            /><br />
            {showPaperworkAdoptionField 
                ? <PaperworkField />
                : null}
            {showSurrenderedDogField && type
                ? <>
                    <TextField
                        id="outlined-controlled"
                        label={"Surrendered Dog"}
                        margin="dense"
                        style={{marginRight: 5}}
                        value={surrenderedDog}
                        error={type == AppointmentType.SURRENDER && surrenderedDog.length === 0}
                        onChange={(e) => setSurrenderedDog(e.target.value)}
                    /><br />
                </> 
                : null}
            {showSurrenderedDogFkaField && type
                ? <>
                    <TextField
                        id="outlined-controlled"
                        label={"FKA"}
                        margin="dense"
                        style={{marginRight: 5}}
                        value={surrenderedDogFka}
                        onChange={(e) => setSurrenderedDogFka(e.target.value)}
                    /><br />
                </> 
                : null}
            {showNotesField && type && <TextField
                id="outlined-controlled"
                label={type == AppointmentType.VISIT ? "Dog" : "Notes"}
                margin="dense"
                style={{marginRight: 5}}
                value={notes}
                fullWidth
                error={AppointmentTypeFunctions.isNonPaperworkAdminAppointment(type) && 
                    !AppointmentTypeFunctions.isSurrenderAppointment(type) && 
                    notes.length === 0}
                onChange={(e) => setNotes(e.target.value)}
            />}
            {showLockedField && <CheckboxField 
                id={"locked"} 
                toggleValue={() => setLocked(!locked)} 
                checkByDefault={locked} 
                labelText={"Lock Appointment"}            
            />}
        </div>
    </ModalWithButton>
}