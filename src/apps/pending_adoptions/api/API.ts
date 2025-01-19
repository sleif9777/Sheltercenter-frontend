import { API } from "../../../api/API"

export class PendingAdoptionsAPI extends API {
    constructor() {
        super("PendingAdoptions")
    }

    GetAllPendingAdoptions() {
        const path = this.buildCommandPath("GetAllPendingAdoptions")
        return this.get(path)
    }

    // TODO: Make this just a param of above instead of its own command
    GetAllPendingAdoptionsAwaitingPaperwork() {
        const path = this.buildCommandPath("GetAllPendingAdoptionsAwaitingPaperwork")
        return this.get(path)
    }

    MarkStatus(id: number, status: number, heartworm: boolean = false, message?: string) {
        const data = {
            id: id,
            heartworm: heartworm,
            status: status,
            message: message ?? ""
        }

        const path = this.buildCommandPath("MarkStatus")
        return this.post(path, data)
    }

    CreatePendingAdoption(data: {}) {
        const path = this.buildCommandPath("CreatePendingAdoption")
        return this.post(path, data)
    }

    CreateUpdate(id: number, message: string, subject: string) {
        const data = {
            adoptionID: id,
            message: message,
            subject: subject,
        }
        const path = this.buildCommandPath("CreateUpdate")

        return this.post(path, data)
    }
}