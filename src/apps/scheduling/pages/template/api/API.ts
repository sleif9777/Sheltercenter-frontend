import { API } from "../../../../../api/API"
import { Weekday } from "../../../enums/Enums"
import { ITemplateAppointment } from "../models/TemplateAppointment"

export class TemplateAppointmentsAPI extends API {
    constructor() {
        super("TemplateAppointments")
    }

    GetAllTemplateAppointments(weekday: Weekday) {
        const path = this.buildCommandPath("GetAllTemplateAppointments", { "weekday": weekday.toString() })
        return this.get(path)
    }

    CreateTemplateAppointment(data: Omit<ITemplateAppointment, "instant">) {
        const path = this.buildCommandPath("CreateTemplateAppointment")
        return this.post(path, data)
    }

    delete(id: number) {
        return super.delete(id)
    }
}