import { faCat, faDog, faHorse, faLock, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useStore } from "zustand";

import { StandardCard } from "../../../../../../components/card/Card";
import { CardColor } from "../../../../../../components/card/CardEnums";
import { CardItemListSection } from "../../../../../../components/card/CardItemListSection";
import { CardTableSection, DataRow } from "../../../../../../components/card/CardTableSection";
import { TwoColumnListItem } from "../../../../../../components/two_column_list/TwoColumnList";
import { useSessionState } from "../../../../../../session/SessionState";
import { isSurrenderAppointment } from "../../../../utils/AppointmentTypeUtils";
import { Appointment } from "../../models/Appointment";
import { useSchedulingHomeState } from "../../state/State";
import { AppointmentCardActions } from "./AppointmentCardActions";

export type AppointmentCardContext = "Timeslot" | "Current Appointment" | "Adopter Detail"

interface AppointmentCardProps {
    appointment: Appointment,
    context: AppointmentCardContext // TODO: ENUM
}

export function AppointmentCard(props: AppointmentCardProps) {
    const { appointment, context } = props
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const booking = appointment.getCurrentBooking()

    var bookingDisclaimer: JSX.Element | null = null
    if (store.userCurrentAppointment && 
        session.adopterUser &&
        appointment.id != store.userCurrentAppointment.id) {
        bookingDisclaimer = <i>
            You may only have one appointment booked. Cancel your current appointment to enable booking this appointment.
        </i>
    }

    if (session.adopterUser && appointment.locked) {
        bookingDisclaimer = <i>
            This appointment is restricted from open booking. If you are interested in this appointment, contact adoptions@savinggracenc.org.
        </i>
    }

    const topDetails: TwoColumnListItem[] = [
        {text: `(${appointment.getType()})`},
    ]

    if (appointment.getCurrentBooking() && appointment.outcome != 4) {
        topDetails.push({text: appointment.getAdopterVisitorCount()})
    }

    if (appointment.checkInTime) {
        const checkInTime = moment(appointment.checkInTime)
        
        const formatted: string = checkInTime.tz("America/New_York").format("h:mm A")

        let checkInDetails: string = `Checked in ${formatted}`

        if (appointment.counselor) {
            checkInDetails += ` (${appointment.counselor})`
        }

        topDetails.push({ text: checkInDetails })
        topDetails.push({ text: appointment.clothingDescription })
    }

    if (appointment.checkOutTime) {
        topDetails.push({ text: `Checked out ${moment(appointment.checkOutTime).format("h:mm A")}` })
    }
    
    if (appointment.outcome != undefined) {
        topDetails.push({ text: appointment.getOutcome() })
    }

    function ContactInfoSection() {
        if (!booking) {
            return
        }

        const data = [
            { text: booking.adopter.primaryEmail ?? "" },
            { text: booking.adopter.phoneNumber ?? "" }
        ]

        return <CardItemListSection 
            data={data}
            title="Contact Info"
            showBorder={true}
        />
    }

    function NotesSection() {
        if (isSurrenderAppointment(appointment.type)) {
            return <CardTableSection 
                data={[
                    { label: "From Adoptions", content: appointment.appointmentNotes }
                ]}
                title="Notes"
                showBorder={false}
            />
        }

        if (!booking || 
                (!booking.adopter.adopterNotes && 
                !booking.adopter.internalNotes && 
                !booking.adopter.applicationComments)) {
            return
        }

        let data: DataRow[] = []

        if (!session.adopterUser) {
            data.push({ label: "From Adoptions", content: booking.adopter.internalNotes })
        }

        data.push({ label: "From Shelterluv", content: booking.adopter.applicationComments })
        data.push({ label: `From ${booking.adopter.firstName}`, content: booking.adopter.adopterNotes })

        return <CardTableSection 
            data={data}
            title="Notes"
            showBorder={true}
        />
    }

    // TODO: Put this into more discrete functions
    function AboutSection() {
        if (!booking) {
            return
        }

        const data: TwoColumnListItem[] = [
            { text: `Booked ${moment(booking.created).format("M/D/YYYY h:mm A")}` }
        ]

        if (booking.adopter.activityLevel) {
            const activityLevelStr = () => {
                switch (booking.adopter.activityLevel) {
                    case 0:
                        return "Low"
                    case 1:
                        return "Medium"
                    case 2:
                        return "High"
                    case 3:
                        return "Very High"
                }
            }

            data.push({ text: `${activityLevelStr()} activity household` })
        }

        if (booking.adopter.city && booking.adopter.state) {
            data.push({ text: `From ${booking.adopter.city}, ${booking.adopter.state}` })
        }

        switch (booking.adopter.genderPreference) {
            case 0:
                data.push({ text: "Only interested in males" })
                break
            case 1:
                data.push({ text: "Only interested in females" })
                break
            default:
                break
        }

        switch (booking.adopter.agePreference) {
            case 0:
                data.push({ text: "Only interested in adults" })
                break
            case 1:
                data.push({ text: "Only interested in puppies" })
                break
            default:
                break
        }

        if (booking.adopter.minWeightPreference && booking.adopter.maxWeightPreference) {
            data.push({ text: `Prefers between ${booking.adopter.minWeightPreference} and ${booking.adopter.maxWeightPreference} lbs.` })
        } else if (booking.adopter.minWeightPreference) {
            data.push({ text: `Prefers over ${booking.adopter.minWeightPreference} lbs.` })
        } else if (booking.adopter.maxWeightPreference) {
            data.push({ text: `Prefers under ${booking.adopter.maxWeightPreference} lbs.` })
        }

        if (booking.adopter.lowAllergy) {
            data.push({ text: "Prefers low-allergy/hypoallergenic!"} )
        }

        var housingTypeStr, housingOwnershipStr
        switch (booking.adopter.housingType) {
            case 0:
                housingTypeStr = "House"
                break
            case 1:
                housingTypeStr = "Apartment"
                break
            case 2:
                housingTypeStr = "Condo"
                break
            case 3:
                housingTypeStr = "Townhouse"
                break
            case 4:
                housingTypeStr = "Dorm"
                break
            case 5:
                housingTypeStr = "Mobile Home"
                break
        }

        switch (booking.adopter.housingOwnership) {
            case 0:
                housingOwnershipStr = "Own"
                break
            case 1:
                housingOwnershipStr = "Rent"
                break
            case 2:
                housingOwnershipStr = "Lives with Parents"
                break
        }

        if (housingTypeStr && housingOwnershipStr) {
            data.push({ text: `${housingTypeStr} (${housingOwnershipStr})` })
        } else if (housingTypeStr) {
            data.push({ text: `${housingTypeStr}` })
        } else if (housingOwnershipStr) {
            data.push({ text: `Unknown Housing Type (${housingOwnershipStr})` })
        }

        if (booking.adopter.hasFence) {
            data.push({ text: "Has fence" })
        }

        const petsInHome = () => {
            const pets = []

            if (booking.adopter.dogsInHome) {
                pets.push('dogs')
            }

            if (booking.adopter.catsInHome) {
                pets.push('cats')
            }

            if (booking.adopter.otherPetsInHome) {
                pets.push(`other (${booking.adopter.otherPetsComment})`)
            }

            return pets.length > 0
                ? "Pets in home: " + pets.join(", ")
                : ""
        }

        if (petsInHome().length > 0) {
            data.push({ text: petsInHome() })
        }

        return <CardItemListSection 
            data={data}
            title={`About ${booking.adopter.firstName}`}
            showBorder={false}
        />
    }

    function BookingInfo() {
        return <>
            <ContactInfoSection />
            <NotesSection />
            <AboutSection />
        </>
    }

    const showBookingInfo = booking && appointment.outcome == undefined
    const showSurrenderNotes = !showBookingInfo &&
            isSurrenderAppointment(appointment.type) &&
            appointment.appointmentNotes &&
            appointment.appointmentNotes.length > 0

    const description = () => {
        return <>
            { context == "Current Appointment" || context == "Adopter Detail"
                ? moment(appointment.instant).tz("America/New_York").format("MMM D, h:mm A")
                : appointment.getAppointmentDescription() }
            <span style={{ whiteSpace: "nowrap" }}>
                {appointment.locked ? <FontAwesomeIcon icon={faLock} style={{ marginLeft: 5 }} /> : null}
                {booking?.adopter.mobility ? <FontAwesomeIcon icon={faWheelchair} style={{ marginLeft: 5 }} /> : null}
                {booking?.adopter.bringingDog ? <FontAwesomeIcon icon={faDog} style={{ marginLeft: 5 }} /> : null}
                {booking?.adopter.catsInHome ? <FontAwesomeIcon icon={faCat} style={{ marginLeft: 5 }} /> : null}
                {booking?.adopter.otherPetsInHome ? <FontAwesomeIcon icon={faHorse} style={{ marginLeft: 5 }} /> : null}
            </span>
        </>
    } 

    return <StandardCard
        actions={AppointmentCardActions(appointment, context)} 
        color={CardColor.GRAY}
        description={description()}
        topDetails={topDetails}
    >
        {bookingDisclaimer}
        {showBookingInfo ? <BookingInfo /> : null}
        {showSurrenderNotes ? <NotesSection /> : null}
    </StandardCard>
}