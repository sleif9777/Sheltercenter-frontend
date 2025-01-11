import moment from "moment";
import { Adopter, IAdopter } from "../../../../adopters/models/Adopter";

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
        return `Booked ${moment(this.created).format("M/D/YYYY h:mm A")}`
    }
}