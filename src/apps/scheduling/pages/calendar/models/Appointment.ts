import moment from "moment"
import { AppointmentType } from "../../../enums/Enums"
import { AppointmentBase, IAppointmentBase } from "../../../models/AppointmentBase"
import { AxiosResponse } from "axios"
import { AppointmentsAPI } from "../api/AppointmentsAPI"
import { SchedulingHomeContext } from "../state/State"
import { Booking, IBooking } from "./Booking"
import { SecurityLevel } from "../../../../../session/SecurityLevel"
import { DataRow } from "../../../../../components/card/CardTableSection"

export interface IAppointment extends IAppointmentBase {
    id: number,
    locked: boolean,
    bookings?: IBooking[],
    checkInTime?: Date,
    checkOutTime?: Date,
    clothingDescription?: string
    counselor?: string
    outcome?: number,
    chosenDog?: string,
    sourceAdoptionDog?: string,
    sourceAdoptionID?: number,
    paperworkAdoptionDog?: string,
    paperworkAdoptionID?: number,
    heartwormPositive: boolean,
    appointmentNotes?: string,
    surrenderedDog?: string,
    surrenderedDogFka?: string,
}

export class Appointment extends AppointmentBase implements IAppointment {
    id: number
    locked: boolean
    bookings: Booking[]
    checkInTime?: Date
    checkOutTime?: Date
    clothingDescription?: string
    counselor?: string
    outcome?: number
    chosenDog?: string
    sourceAdoptionDog?: string
    sourceAdoptionID?: number
    paperworkAdoptionDog?: string
    paperworkAdoptionID?: number
    heartwormPositive: boolean
    appointmentNotes?: string
    surrenderedDog?: string
    surrenderedDogFka?: string

    constructor(dto: IAppointment) {
        super(dto)
        this.id = dto.id
        this.locked = dto.locked
        this.bookings = dto.bookings?.map(b => new Booking(b)) ?? []
        this.checkInTime = dto.checkInTime,
        this.checkOutTime = dto.checkOutTime
        this.clothingDescription = dto.clothingDescription
        this.counselor = dto.counselor
        this.outcome = dto.outcome
        this.chosenDog = dto.chosenDog
        this.sourceAdoptionDog = dto.sourceAdoptionDog
        this.sourceAdoptionID = dto.sourceAdoptionID
        this.paperworkAdoptionDog = dto.paperworkAdoptionDog
        this.paperworkAdoptionID = dto.paperworkAdoptionID
        this.heartwormPositive = dto.heartwormPositive
        this.appointmentNotes = dto.appointmentNotes
        this.surrenderedDog = dto.surrenderedDog
        this.surrenderedDogFka = dto.surrenderedDogFka
    }

    // LOGIC THAT SHOULD PROBABLY GET MOVED
    static async fetchAppointmentsForDate(viewDate: Date, userID: number): Promise<SchedulingHomeContext> {
        const response: AxiosResponse<SchedulingHomeContext> = await new AppointmentsAPI().GetContextForDate(viewDate, userID)
        return response.data
    }

    // DISPLAY HELPERS
    getType(): string {
        if (this.type === AppointmentType.PAPERWORK) {
            if (this.heartwormPositive) {
                return "Paperwork - FTA"
            }
            return "Paperwork - Adoption"
        }

        return super.getType()
    }

    getAppointmentDescription(): string {
        if (this.isAdoptionAppointment()) {
            const currentBooking = this.getCurrentBooking()
    
            if (currentBooking) {
                return currentBooking.adopter.fullName
            }
    
            return "OPEN"
        }

        if (this.isSurrenderAppointment()) {
            if (this.surrenderedDogFka) {
                return `${this.surrenderedDog} (fka ${this.surrenderedDogFka})`
            }

            return this.surrenderedDog ?? "UNKNOWN"
        }

        if (this.isPaperworkAppointment()) {
            return this.paperworkAdoptionDog ?? "UNKNOWN"
        }

        if (this.type === AppointmentType.DONATION_DROP_OFF) {
            return "DONATION DROP-OFF"
        }

        return this.appointmentNotes!
    }

    getOutcome() {
        if (this.outcome == undefined) {
            return ""
        }

        var outcomeString = ""

        switch (this.outcome) {
            case 0:
                outcomeString = "Adoption"
                break
            case 1:
                outcomeString = "FTA"
                break
            case 2:
                outcomeString = "Chosen"
                break
            case 3:
                outcomeString = "No Decision"
                break
            case 4:
                outcomeString = "No Show"
                break
        }

        if (this.outcome < 3) {
            return outcomeString?.toLocaleUpperCase() + ": " + this.chosenDog
        }

        return outcomeString.toLocaleUpperCase()
    }

    getAdopterVisitorCount() {
        const count = this.getCurrentBooking()!.previousVisits + 1
        var suffix, exclamations = ""

        if (count >= 11 && count <= 13) {
            suffix = "th"
        } else if (count % 10 == 1) {
            suffix = "st"
        } else if (count % 10 == 2) {
            suffix = "nd"
        } else if (count % 10 == 3) {
            suffix = "rd"
        } else {
            suffix = "th"
        }

        if (count > 5) {
            exclamations = "!!!!"
        } else if (count > 4) {
            exclamations = "!!!"
        } else if (count > 3) {
            exclamations = "!!"
        } else if (count === 3) {
            exclamations = "!"
        }
        
        return `${count}${suffix} visit${exclamations}`
    }

    getCheckInTime() {
        if (!this.checkInTime) {
            return
        }

        return moment(this.checkInTime).format("h:mm A")
    }

    getCheckOutTime() {
        if (!this.checkOutTime) {
            return
        }
        
        return moment(this.checkOutTime).format("h:mm A")
    }

    getNotesToDisplay(sec?: SecurityLevel): DataRow[] {
        let data: DataRow[] = []
        const booking = this.getCurrentBooking()

        if (this.isSurrenderAppointment()) {
            data.push({ label: "From Adoptions", content: this.appointmentNotes })
        } else if (booking) {
            if (sec && sec > SecurityLevel.ADOPTER) {
                data.push({ label: "From Adoptions", content: booking.adopter.internalNotes })
            }

            data.push({ label: "From Shelterluv", content: booking.adopter.applicationComments })
            data.push({ label: `From ${booking.adopter.firstName}`, content: booking.adopter.adopterNotes })
        }

        return data.filter(d => d.content && d.content.length > 0)
    }

    // OTHER METHODS
    isAdoptionAppointment(): boolean {
        return [
            AppointmentType.ADULTS,
            AppointmentType.PUPPIES,
            AppointmentType.ALL_AGES,
            AppointmentType.FUN_SIZE
        ].includes(this.type)
    }

    isAdminAppointment(): boolean {
        return !this.isAdoptionAppointment()
    }
    
    isPaperworkAppointment() {
        return this.type === AppointmentType.PAPERWORK
    }
    
    isNonPaperworkAdminAppointment() {
        return this.isAdminAppointment() && !this.isPaperworkAppointment()
    }
    
    isSurrenderAppointment() {
        return this.type === AppointmentType.SURRENDER
    }

    isOnOrAfterToday(): boolean {
        const adjustedInstant = moment(this.instant)
        adjustedInstant.set("hours", 0)
        adjustedInstant.set("minutes", 0)
        adjustedInstant.set("seconds", 0)
        adjustedInstant.set("milliseconds", 0)

        const adjustedToday: moment.Moment = moment()
        adjustedToday.set("hours", 0)
        adjustedToday.set("minutes", 0)
        adjustedToday.set("seconds", 0)
        adjustedToday.set("milliseconds", 0)

        return adjustedInstant >= adjustedToday
    }

    getCurrentBooking(): Booking | null {
        return this.bookings.find(b => b.status == 0) || this.bookings.find(b => b.status >= 3) || null
    }

    isBooked(): boolean {
        return this.getCurrentBooking() != null
    }

    showToAdopter(userID: number): boolean {
        const booking = this.getCurrentBooking()

        if (booking != null) {
            return booking.adopter.userID == userID
        } else if (this.isAdoptionAppointment()) {
            return moment(this.instant).diff(moment(), "hours") >= 2
        }

        return false
    }
}