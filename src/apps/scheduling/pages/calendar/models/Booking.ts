import { Adopter, IAdopter } from "../../../../adopters/models/Adopter";
import { DateTime } from "../../../../../utils/DateTimeUtils";

export interface IBooking {
    adopter: IAdopter,
    id: number,
    status: number,
    created: Date,
    modified?: Date,
    previousVisits: number,
}

export class Booking {
    adopter: Adopter
    id: number
    status: number
    created: Date
    modified?: Date
    previousVisits: number

    constructor(dto: IBooking) {
        this.adopter = new Adopter(dto.adopter)
        this.id = dto.id
        this.status = dto.status
        this.created = dto.created
        this.modified = dto.modified
        this.previousVisits = dto.previousVisits
    }

    getCreatedInstant() {
        return `Booked ${new DateTime(this.created).Format("M/D/YYYY h:mm A")}`
    }
}