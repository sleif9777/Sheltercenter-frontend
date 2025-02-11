import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { AxiosResponse } from "axios"
import { useState } from "react"
import { useStore } from "zustand"

import ButtonGroup from "../../../../../../components/forms/fields/ButtonGroup"
import { CheckboxField } from "../../../../../../components/forms/fields/CheckboxField"
import { Required } from "../../../../../../components/forms/Required"
import { Message } from "../../../../../../components/message/Message"
import ModalWithButton from "../../../../../../components/modals/ModalWithButton"
import { SecurityLevel } from "../../../../../../session/SecurityLevel"
import { useSessionState } from "../../../../../../session/SessionState"
import { AdopterAPI } from "../../../../../adopters/api/API"
import { IAdopter } from "../../../../../adopters/models/Adopter"
import { AppointmentType } from "../../../../enums/Enums"
import { AppointmentsAPI } from "../../api/AppointmentsAPI"
import { Appointment } from "../../models/Appointment"
import { useSchedulingHomeState } from "../../state/State"
import { faDog, faHeadSideCough, faWheelchair } from "@fortawesome/free-solid-svg-icons"

interface BookingFormProps {
    appointment: Appointment,
    extendOnSubmit?: () => any,
    launchBtnLabel: string | JSX.Element
}

export function AdopterBookingForm(props: BookingFormProps) {
    const { appointment, extendOnSubmit, launchBtnLabel } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const booking = appointment.getCurrentBooking()

    const [adopter, setAdopter] = useState<IAdopter>()
    const [adopterOptions, setAdopterItems] = useState<IAdopter[]>([]) // TODO: rename one or the other

    const [adopterNotes, setAdopterNotes] = useState<string>("")
    const [internalNotes, setInternalNotes] = useState<string>("")

    const [housingType, setHousingType] = useState<number>() // TODO: ENUM
    const [housingOwnership, setHousingOwnership] = useState<number>() //TODO: ENUM
    const [hasFence, setHasFence] = useState<boolean>()

    const [genderPreference, setGenderPreference] = useState<number>() // TODO: ENUM
    const [agePreference, setAgePreference] = useState<number>() // TODO: ENUM
    const [minWeightPreference, setMinWeightPreference] = useState<number>()
    const [maxWeightPreference, setMaxWeightPreference] = useState<number>()

    const [activityLevel, setActivityLevel] = useState<number>()
    const [lowAllergy, setLowAllergy] = useState<boolean>(false)

    const [mobility, setMobility] = useState<boolean>(false)
    const [bringingDog, setBringingDog] = useState<boolean>(false)
    const [hasDogs, setHasDogs] = useState<boolean>(false)
    const [hasCats, setHasCats] = useState<boolean>(false)
    const [hasOtherPets, setHasOtherPets] = useState<boolean>(false)
    const [otherPetsComment, setOtherPetsComment] = useState<string>("")

    const [errorMsg, setErrorMsg] = useState<string>("")

    const setDefaults = (newAdopter?: IAdopter) => {
        if (newAdopter) {
            setAdopter(newAdopter)
            setAdopterNotes(newAdopter.adopterNotes ?? "")
            setInternalNotes(newAdopter.internalNotes ?? "")
            setHousingType(newAdopter.housingType)
            setHousingOwnership(newAdopter.housingOwnership)
            setHasFence(newAdopter.hasFence)
            setGenderPreference(newAdopter.genderPreference)
            setAgePreference(newAdopter.agePreference)
            setMinWeightPreference(newAdopter.minWeightPreference)
            setMaxWeightPreference(newAdopter.maxWeightPreference)
            setActivityLevel(newAdopter.activityLevel)
            setLowAllergy(newAdopter.lowAllergy)
            setMobility(newAdopter.mobility)
            setBringingDog(newAdopter.bringingDog)
            setHasDogs(newAdopter.dogsInHome)
            setHasCats(newAdopter.catsInHome)
            setHasOtherPets(newAdopter.otherPetsInHome)
            setOtherPetsComment(newAdopter.otherPetsComment ?? "")
        } else {
            setAdopter(undefined)
            setAdopterNotes("")
            setInternalNotes("")
            setHousingType(undefined)
            setHousingOwnership(undefined)
            setHasFence(undefined)
            setActivityLevel(undefined)
            setGenderPreference(undefined)
            setAgePreference(undefined)
            setMinWeightPreference(undefined)
            setMaxWeightPreference(undefined)
            setLowAllergy(false)
            setMobility(false)
            setBringingDog(false)
            setHasDogs(false)
            setHasCats(false)
            setHasOtherPets(false)
            setOtherPetsComment("")
            setWeightPrefMessage("")
        }
    }

    const validate = () => {
        return adopter != undefined && appointment.id != undefined
    }

    const handleOpen = async () => {
        setDefaults(booking?.adopter ?? undefined)
    }

    async function loadAdopterOptions() {
        const API = new AdopterAPI()
        const newAdopters: IAdopter[] = session.adopterUser ? [] : store.adoptersSansAppointment
        const booking = appointment.getCurrentBooking()
        var loadAdopter: number | undefined

        if (session.adopterUser) {
            loadAdopter = session.adopterID
        } else if (booking) {
            loadAdopter = booking.adopter.ID
        }

        if (loadAdopter) {
            const bookedAdopter: AxiosResponse<IAdopter> = await API.GetAdopter(loadAdopter)
            newAdopters.push(bookedAdopter.data)
        }

        var adopterObjs = newAdopters
            .sort((a, b) => {
                return a.fullName > b.fullName ? 1 : -1
            })

        setAdopterItems(adopterObjs) 
        
        if (loadAdopter) {
            setDefaults(adopterObjs.find(a => a.ID === loadAdopter))
        }
    }

    const handleSubmit = async () => {
        if (!validate()) {
            return
        }

        const data = {
            adopterID: adopter!.ID,
            appointmentID: appointment.id,

            adopterNotes: adopterNotes,
            internalNotes: internalNotes,

            housingType: housingType,
            housingOwnership: housingOwnership,
            activityLevel: activityLevel,
            hasFence: hasFence,
            hasDogs: hasDogs,
            hasCats: hasCats,
            hasOtherPets: hasOtherPets,
            otherPetsComment: otherPetsComment,

            genderPreference: genderPreference,
            agePreference: agePreference,
            minWeightPreference: minWeightPreference,
            maxWeightPreference: maxWeightPreference,
            lowAllergy: lowAllergy,
            
            mobility: mobility,
            bringingDog: bringingDog,
        }

        const response: AxiosResponse = await new AppointmentsAPI().ScheduleAppointment(data)
        
        if (response.status === 203) {
            setErrorMsg("Appointment no longer available. Refresh and try again.")
        } else {
            store.refresh(store.viewDate, ["adoptions"], session.userID!)
    
            if (extendOnSubmit) {
                extendOnSubmit()
            }
        }

    }

    function AdopterField(props: {options: IAdopter[]}) {
        if (props.options.length < 1) {
            loadAdopterOptions()
        }

        return <>
            <InputLabel id="adopter">Adopter <Required /></InputLabel>
            <Select
                id="adopter"
                value={adopter?.ID}
                label="Adopter"
                disabled={booking != null || session.adopterUser}
                // placeholder="Select an adopter"
                fullWidth
                onChange={(e) => {
                    const newAdopter = adopterOptions.find(a => a.ID == e.target.value)
                    setAdopter(newAdopter)
                    setDefaults(newAdopter)
                }}
            >
                {adopterOptions
                    .map(adopter => <MenuItem value={adopter.ID}>
                        {adopter.disambiguatedName}
                    </MenuItem>)
                }
            </Select>
        </>
    }

    function HasFenceField() {
        const options = [
            { name: "Yes", value: 1 }, // TODO: Make this enum
            { name: "No", value: 0 },
        ]

        return <ButtonGroup 
            show={true} 
            value={hasFence === undefined ? undefined : (hasFence ? 1 : 0)}
            buttons={options} 
            onChange={(_, newValue) => setHasFence(newValue === 1)} 
            labelText={"Fenced Yard?"} 
            id={"has-fenced"}        
        />
    }

    function GenderPreferenceField() {
        const options = [
            { name: "Male", value: 0 }, // TODO: Make this enum
            { name: "Female", value: 1 },
            { name: "No Preference", value: 2 },
        ]

        return <ButtonGroup 
            show={true} 
            value={genderPreference}
            buttons={options} 
            onChange={(_, newValue) => setGenderPreference(newValue)} 
            labelText={"Gender Preference"} 
            id={"gender-preference"}        
        />
    }

    function AgePreferenceField() {
        const options = [
            { name: "Adults", value: 0 }, // TODO: Make this enum
            { name: "Puppies", value: 1 },
            { name: "No Preference", value: 2 },
        ]

        const [message, setMessage] = useState<string>("")

        const warningMessage = <Message 
            level="Warning"
            message={message}
            showMessage={message?.length > 0}
        />

        return <>
            <ButtonGroup 
                show={true} 
                value={agePreference}
                buttons={options} 
                onChange={(_, newValue) => {
                    setAgePreference(newValue)

                    // TODO: make this a separate function
                    if (appointment.type === AppointmentType.ADULTS && newValue === 1) {
                        setMessage("This appointment is for adults only")
                    } else if (appointment.type === AppointmentType.PUPPIES && newValue === 0) {
                        setMessage("This appointment is for puppies only")
                    } else {
                        setMessage("")
                    }
                }} 
                labelText={"Age Preference"} 
                id={"age-preference"}        
            />
            {warningMessage}
        </>
    }

    function HousingTypeField() {
        const options = [
            { name: "House", value: 0 },
            { name: "Apartment", value: 1 },
            { name: "Condo", value: 2 },
            { name: "Townhouse", value: 3 },
            { name: "Dorm", value: 4 },
            { name: "Mobile Home", value: 5 },
        ]

        return <ButtonGroup 
            show={true} 
            value={housingType}
            buttons={options} 
            onChange={(_, newValue) => setHousingType(newValue)} 
            labelText={"Housing Type"} 
            id={"housing"}        
        />
    }

    function HousingOwnershipField() {
        const options = [
            { name: "Own", value: 0 }, // TODO: Make this enum
            { name: "Rent", value: 1 },
            { name: "Live with Parents", value: 2 },
        ]

        return <ButtonGroup 
            show={true} 
            value={housingOwnership}
            buttons={options} 
            onChange={(_, newValue) => setHousingOwnership(newValue)} 
            labelText={"Housing Ownership"} 
            id={"housing-ownership"}        
        />
    }

    function ActivityLevelField() {
        const options = [
            { name: "Low", value: 0 }, // TODO: Make this enum
            { name: "Medium", value: 1 },
            { name: "Active", value: 2 },
            { name: "Very Active", value: 3 }
        ]

        return <ButtonGroup 
            show={true} 
            value={activityLevel}
            buttons={options} 
            onChange={(_, newValue) => setActivityLevel(newValue)} 
            labelText={"Activity Level"} 
            id={"activity-level"}        
        />
    }

    function RequiresLowAllergyField() {
        return <CheckboxField 
            id={"low-allergy"} 
            toggleValue={() => setLowAllergy(!lowAllergy)} 
            checkByDefault={lowAllergy} 
            customIcon={faHeadSideCough}
            labelText={"I require a low-allergy dog"}            
        />
    }

    function MobilityField() {
        return <CheckboxField 
            id={"mobility"} 
            toggleValue={() => setMobility(!mobility)} 
            checkByDefault={mobility} 
            customIcon={faWheelchair}
            labelText={"I would like to request mobility assistance"}            
        />
    }

    function BringingDogsField() {
        return <CheckboxField 
            id={"bringing-dogs"} 
            toggleValue={() => setBringingDog(!bringingDog)} 
            checkByDefault={bringingDog} 
            customIcon={faDog}
            labelText={"I plan to bring my dog(s) with me"}            
        />
    }

    const [weightPrefMessage, setWeightPrefMessage] = useState<string>("")
    function WeightPrefWarningMessage() {
        return <Message 
            level="Warning"
            message={weightPrefMessage}
            showMessage={weightPrefMessage?.length > 0}
        />
    } 

    function PetsAtHomeFields() {
        return <div>
            I have the following pets at home:
            <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
                <li>
                    <CheckboxField 
                        id={"dog"} 
                        toggleValue={() => setHasDogs(!hasDogs)} 
                        checkByDefault={hasDogs} 
                        labelText={"Dogs"}            
                    />
                </li>
                <li>
                    <CheckboxField 
                        id={"cat"} 
                        toggleValue={() => setHasCats(!hasCats)} 
                        checkByDefault={hasCats} 
                        labelText={"Cats"}            
                    />
                </li>
                <li>
                    <CheckboxField 
                        id={"other-animal"} 
                        toggleValue={() => setHasOtherPets(!hasOtherPets)} 
                        checkByDefault={hasOtherPets} 
                        labelText={"Other"}            
                    />
                </li>
            </ul>
        </div>
    }

    function AllFieldsOptionalMessage() {
        const messageText = session.adopterUser
            ? "All fields are optional."
            : "All fields (except Adopter) are optional. Only adopters that have a valid application and no active booking are available."
    
        return <Message 
            level={"Default"} 
            message={messageText} 
            showMessage={true} 
        />
    }

    function getTooltip() {
        if (store.currentlyRefreshingAdopters) {
            return "Loading..."
        }

        return booking ? "Edit Booking" : "Book Appointment"
    }

    return <ModalWithButton 
        buttonClass={"grey-card-link"} 
        canSubmit={() => validate()}
        height={"90%"}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => setDefaults()}
        extendOnOpen={() => handleOpen()}
        launchBtnLabel={launchBtnLabel}
        buttonId={`edit-appt-${appointment.id}`}
        modalTitle="Book Appointment"
        tooltipText={getTooltip()}
        disabled={store.currentlyRefreshingAdopters}
    >
        <div className="form-content">
            {AllFieldsOptionalMessage()}
            <table>
                <tr>
                    <td className="two-column">
                        <AdopterField options={adopterOptions} />
                        <ActivityLevelField />
                        <HasFenceField />
                    </td>
                    <td className="two-column">
                        <div>
                            {session.securityLevel == SecurityLevel.ADOPTER
                                    ? <TextField
                                        id="outlined-controlled"
                                        label="Notes"
                                        margin="dense"
                                        maxRows={4}
                                        fullWidth
                                        style={{marginRight: 5}}
                                        value={adopterNotes}
                                        error={adopterNotes.length > 100}
                                        onChange={(e) => setAdopterNotes(e.target.value)}
                                    />
                                    : <TextField
                                        key={"internal-notes"}
                                        id="outlined-controlled"
                                        label="Internal Notes"
                                        margin="dense"
                                        maxRows={4}
                                        fullWidth
                                        style={{marginRight: 5}}
                                        value={internalNotes}
                                        error={internalNotes.length > 500}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                    />}
                            <HousingTypeField />
                            <HousingOwnershipField />
                        </div>
                    </td>
                </tr>
            </table>
            <hr />
            <table>
                <tr>
                    <td className="two-column">
                        <GenderPreferenceField />
                        <AgePreferenceField />
                        <RequiresLowAllergyField />
                        <MobilityField />
                        <BringingDogsField />
                    </td>
                    <td className="two-column">
                        <div>
                            Leave either field blank to indicate no min/max weight
                            <label 
                                className="modal-form" 
                                htmlFor="min-weight"
                                style={{verticalAlign: "middle"}}
                            >
                                Min Weight
                                <input 
                                    type="number" 
                                    id="min-weight"
                                    value={minWeightPreference}
                                    onChange={(e) => setMinWeightPreference(e.target.valueAsNumber)} 
                                    style={{
                                        marginLeft: 4,
                                        verticalAlign: "middle"
                                    }}
                                />
                            </label>
                            <label 
                                className="modal-form" 
                                htmlFor="max-weight"
                                style={{verticalAlign: "middle"}}
                            >
                                Max Weight
                                <input 
                                    type="number" 
                                    id="max-weight"
                                    value={maxWeightPreference}
                                    onChange={(e) => {
                                        setMaxWeightPreference(e.target.valueAsNumber)

                                        if (maxWeightPreference != undefined && 
                                            maxWeightPreference <= 20 && 
                                            appointment.type != AppointmentType.FUN_SIZE) {
                                            setWeightPrefMessage("Dogs under 20 lbs. require a fun-size appointment (usually Fridays and Saturdays)")
                                        } else {
                                            setWeightPrefMessage("")
                                        }
                                    }} 
                                    style={{
                                        marginLeft: 4,
                                        verticalAlign: "middle"
                                    }}
                                />
                            </label>
                            <WeightPrefWarningMessage />
                        </div>
                        <hr />
                        <PetsAtHomeFields />
                        {hasOtherPets ? <TextField
                            id="outlined-controlled"
                            hidden={!hasOtherPets}
                            label="Species"
                            margin="dense"
                            value={otherPetsComment}
                            onChange={(e) => setOtherPetsComment(e.target.value)}
                        /> : null}
                    </td>
                </tr>
            </table>
            <Message level={"Error"} message={errorMsg} showMessage={errorMsg.length > 0} />
        </div>
    </ModalWithButton>
}