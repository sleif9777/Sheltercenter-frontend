import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { AxiosResponse } from "axios"
import moment from "moment"
import { useEffect, useState } from "react"
import { useStore } from "zustand"

import ButtonGroup from "../../../../../../components/forms/fields/ButtonGroup"
import { CheckboxField } from "../../../../../../components/forms/fields/CheckboxField"
import { TimeField } from "../../../../../../components/forms/fields/TimeField"
import ModalWithButton from "../../../../../../components/modals/ModalWithButton"
import { SecurityLevel } from "../../../../../../session/SecurityLevel"
import { useSessionState } from "../../../../../../session/SessionState"
import { PendingAdoptionsAPI } from "../../../../../pending_adoptions/api/API"
import { IPendingAdoption } from "../../../../../pending_adoptions/models/PendingAdoption"
import { ChosenBoardContext } from "../../../../../pending_adoptions/state/State"
import { AppointmentType } from "../../../../enums/Enums"
import { isAdminAppointment, isAdoptionAppointment, isNonPaperworkAdminAppointment, isPaperworkAppointment, isSurrenderAppointment } from "../../../../utils/AppointmentTypeUtils"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { IAppointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"

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
    const [instant, setInstant] = useState<Date | undefined>(defaults ? defaults.instant.toDate() : undefined)
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

    useEffect(() => {
        if (paperworkAdoptionOptions.length === 0) {
            setPaperworkAdoptionOptions(store.adoptionsSansPaperwork)
        }
    }, [])


    const resetForm = () => {
        if (defaults) {
            setType(defaults.type)
            setInstant(defaults.instant.toDate())
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

        if (isPaperworkAppointment(type)) {
            return paperworkAdoption != undefined
        }

        if (isSurrenderAppointment(type)) {
            return surrenderedDog.length > 0
        }

        if (isAdminAppointment(type)) {
            return notes.length > 0
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validate()) {
            return
        }

        const data: Omit<IAppointment, "id" | "heartwormPositive"> = {
            type: type!,
            locked: locked,
            instant: moment(instant!),
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

    return <ModalWithButton 
        buttonClass={"submit-button " + (buttonClassOverride ?? "")} 
        buttonId={"add-appointment"} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => resetForm()}
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
                        // setShowSubtypeField(false)
                        // setSubtype(undefined)
                        setShowPaperworkAdoptionField(false)
                        setPaperworkAdoption(undefined)
                        setShowLockedField(true)
                        setLocked(false)
                        setShowNotesField(false)
                        setShowSurrenderedDogField(false)
                        setShowSurrenderedDogFkaField(false)
                        setNotes("")
                        setSurrenderedDog("")
                        setSurrenderedDogFka("")
                    } else {
                        setShowPaperworkAdoptionField(isPaperworkAppointment(newType))
                        setPaperworkAdoption(isPaperworkAppointment(newType) ? paperworkAdoption : undefined)
                        setShowLockedField(isAdoptionAppointment(newType))
                        setLocked(isAdoptionAppointment(newType) ? locked : false)
                        setShowNotesField(isNonPaperworkAdminAppointment(newType))
                        setShowSurrenderedDogField(isSurrenderAppointment(newType))
                        setShowSurrenderedDogFkaField(isSurrenderAppointment(newType))
                        setNotes(isNonPaperworkAdminAppointment(newType) ? notes : "")
                        setSurrenderedDog(isSurrenderAppointment(newType) ? surrenderedDog : "")
                        setSurrenderedDogFka(isSurrenderAppointment(newType) ? surrenderedDogFka : "")
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
                ? <>
                    <InputLabel id="dog">Dog</InputLabel>
                    <Select
                        id="dog"
                        value={paperworkAdoption?.id}
                        label="Adoption"
                        // placeholder="Select an adoption"
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
                : null}
            {showSurrenderedDogField && type
                ? <TextField
                    id="outlined-controlled"
                    label={"Surrendered Dog"}
                    margin="dense"
                    style={{marginRight: 5}}
                    value={surrenderedDog}
                    error={type == AppointmentType.SURRENDER && surrenderedDog.length === 0}
                    onChange={(e) => setSurrenderedDog(e.target.value)}
                />
                : null}<br />
            {showSurrenderedDogFkaField && type
                ? <TextField
                    id="outlined-controlled"
                    label={"FKA"}
                    margin="dense"
                    style={{marginRight: 5}}
                    value={surrenderedDogFka}
                    onChange={(e) => setSurrenderedDogFka(e.target.value)}
                />
                : null}<br />
            {showNotesField && type
                ? <TextField
                    id="outlined-controlled"
                    label={type == AppointmentType.VISIT ? "Dog" : "Notes"}
                    margin="dense"
                    style={{marginRight: 5}}
                    value={notes}
                    fullWidth
                    error={isNonPaperworkAdminAppointment(type) && !isSurrenderAppointment(type) && notes.length === 0}
                    onChange={(e) => setNotes(e.target.value)}
                />
                : null}
            {showLockedField
                ? <CheckboxField 
                    id={"locked"} 
                    toggleValue={() => setLocked(!locked)} 
                    checkByDefault={locked} 
                    labelText={"Lock Appointment"}            
                />
                : null}
        </div>
    </ModalWithButton>
}