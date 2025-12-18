import { Adopter, IAdopter } from "../../../../adopters/models/Adopter";
import { DateTime } from "../../../../../utils/DateTimeUtils";

export interface IBooking {
    adopter: IAdopter,
    id: number,
    status: number,
    created: Date,
    modified?: Date,
    previousVisits: number,

    sentLimitedPuppies: boolean,
    sentLimitedSmallPuppies: boolean,
    sentLimitedHypo: boolean,
    sentLimitedFunSize: boolean,
    sentDogsWereAdopted: boolean,
    sentDogsNotHereYet: boolean,
    sentXInQueue: boolean,
}

export class Booking {
    adopter: Adopter
    id: number
    status: number
    created: Date
    modified?: Date
    previousVisits: number
    sentLimitedPuppies: boolean
    sentLimitedSmallPuppies: boolean
    sentLimitedHypo: boolean
    sentLimitedFunSize: boolean
    sentDogsWereAdopted: boolean
    sentDogsNotHereYet: boolean
    sentXInQueue: boolean

    constructor(dto: IBooking) {
        this.adopter = new Adopter(dto.adopter)
        this.id = dto.id
        this.status = dto.status
        this.created = dto.created
        this.modified = dto.modified
        this.previousVisits = dto.previousVisits
        this.sentLimitedPuppies = dto.sentLimitedPuppies
        this.sentLimitedSmallPuppies = dto.sentLimitedSmallPuppies
        this.sentLimitedHypo = dto.sentLimitedHypo
        this.sentLimitedFunSize = dto.sentLimitedFunSize
        this.sentLimitedHypo = dto.sentLimitedHypo
        this.sentDogsWereAdopted = dto.sentDogsWereAdopted
        this.sentDogsNotHereYet = dto.sentDogsNotHereYet
        this.sentXInQueue = dto.sentXInQueue
    }

    getCreatedInstant() {
        return `Booked ${new DateTime(this.created).Format("M/D/YYYY h:mm A")}`
    }

    toggleSentTemplate(templateID: number) {
        switch (templateID) {
            case 0:
                this.sentLimitedPuppies = true
                break
            case 1:
                this.sentLimitedSmallPuppies = true
                break
            case 2:
                this.sentLimitedHypo = true
                break
            case 3:
                this.sentLimitedFunSize = true
                break
            case 4:
                this.sentDogsWereAdopted = true
                break
            case 5:
                this.sentDogsNotHereYet = true
                break
            case 6:
                this.sentXInQueue = true
                break
        }
    }
}