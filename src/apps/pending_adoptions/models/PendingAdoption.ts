import { AxiosResponse } from "axios";
import { Adopter, IAdopter } from "../../adopters/models/Adopter";
import { Appointment, IAppointment } from "../../scheduling/pages/calendar/models/Appointment";
import { PendingAdoptionsAPI } from "../api/API";
import moment from "moment";
import { PendingAdoptionCircumstance, PendingAdoptionStatus } from "../enums/Enums";

export interface IPendingAdoptionUpdate {
    type: number,
    instant: Date
}

export interface IPendingAdoption {
    id: number,
    dog: string,
    sourceAppointment?: IAppointment,
    paperworkAppointment?: IAppointment,
    status: PendingAdoptionStatus,
    adopter: IAdopter,
    circumstance: PendingAdoptionCircumstance,
    readyToRollInstant?: Date,
    heartwormPositive: boolean,
    updates: IPendingAdoptionUpdate[],
    created: Date
}

export class PendingAdoption {
    id: number
    dog: string
    sourceAppointment?: Appointment
    paperworkAppointment?: Appointment
    status: number
    adopter: Adopter
    circumstance: PendingAdoptionCircumstance
    readyToRollInstant?: Date
    heartwormPositive: boolean
    updates: IPendingAdoptionUpdate[]
    created: Date

    constructor(dto: IPendingAdoption) {
        this.id = dto.id
        this.dog = dto.dog
        this.sourceAppointment = (dto.sourceAppointment ? new Appointment(dto.sourceAppointment) : undefined)
        this.paperworkAppointment = (dto.paperworkAppointment ? new Appointment(dto.paperworkAppointment) : undefined)
        this.status = dto.status
        this.adopter = new Adopter(dto.adopter)
        this.circumstance = dto.circumstance
        this.readyToRollInstant = dto.readyToRollInstant
        this.heartwormPositive = dto.heartwormPositive
        this.updates = dto.updates
        this.created = dto.created
    }

    static async getAllActivePendingAdoptions(): Promise<PendingAdoption[]> {
        const response: AxiosResponse<{ adoptions: PendingAdoption[] }> = await new PendingAdoptionsAPI().GetAllPendingAdoptions()
        return response.data.adoptions
    }

    getStatus(forHeader: boolean = false) {
        switch (this.status) {
            case 0:
                return "Chosen"
            case 1:
                return "Needs Vetting"
            case 2:
                return "Needs Well Check"
            case 3:
                if (forHeader) {
                    return "Ready to Roll"
                }
                
                if (this.paperworkAppointment) {
                    const status = "Paperwork Scheduled"
                    const hwStatus = this.heartwormPositive ? "HW-Pos" : "HW-Neg"
                    return `${status} (${hwStatus})`
                }
                return "Ready to Roll (" + (this.heartwormPositive ? "HW-Pos)" : "HW-Neg)")
            case 4:
                return "Complete"
            case 5:
                return "Canceled"
        }
    }

    getCircumstance() {
        return [
            { name: "Host Weekend", value: 0 },
            { name: "Foster", value: 1 },
            { name: "Appointment", value: 2 },
            { name: "Open House", value: 6},
            { name: "Friend of Foster", value: 3 },
            { name: "Friend of Molly", value: 4 },
            { name: "Other", value: 5 },
        ].find(c => c.value == this.circumstance)?.name
    }

    overdueForUpdate() {
        if (this.updates.length === 0) {
            return moment(this.created).diff(moment(), "days") > 7
        }

        return moment(this.getLatestUpdate().instant).diff(moment(), "days") > 7
    }

    getSortedUpdates() {
        if (!this.updates) {
            return []
        }

        return this.updates.sort((a, b) => a.instant < b.instant ? 1 : -1)
    }

    getLatestUpdate() {
        return this.getSortedUpdates()[0]
    }

}