import { AxiosResponse } from "axios";
import { AppointmentType, PaperworkAppointmentSubtype, Weekday } from "../../../enums/Enums";
import { AppointmentBase, IAppointmentBase } from "../../../models/AppointmentBase";
import { TemplateAppointmentsAPI } from "../api/API";
import { SimpleTimeslotDictionary } from "../../../components/Timeslot";

export interface ITemplateAppointment extends IAppointmentBase {
    weekday: Weekday,
    time: Date
}

export class TemplateAppointment extends AppointmentBase implements ITemplateAppointment {
    weekday: Weekday
    time: Date
    id?: number | undefined
    type: AppointmentType
    subtype?: PaperworkAppointmentSubtype | undefined

    constructor(dto: ITemplateAppointment) {
        super(dto)
        this.weekday = dto.weekday
        this.time = dto.time
        this.id = dto.id
        this.type = dto.type
        this.subtype = dto.subtype
    }

    getAppointmentDescription(): string {
        return `${this.getType()} at ${this.getTime()}`
    }

    static async fetchAppointmentsForWeekday(weekday: Weekday) {
        const response: AxiosResponse<SimpleTimeslotDictionary> = await new TemplateAppointmentsAPI().GetAllTemplateAppointments(weekday)
        return response.data
    }
}