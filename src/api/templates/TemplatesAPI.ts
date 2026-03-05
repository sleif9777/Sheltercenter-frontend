import { Weekday } from "../../enums/TemplateEnums"
import { APIBase } from "../APIBase"
import { CreateTemplateRequest, WeekdayRequest } from "./Requests"
import { TemplatesForWeekdayResponse } from "./Responses"

export class TemplatesAPI extends APIBase {
	constructor() {
		super("TemplateAppointments")
	}

	async CreateTemplate(request: CreateTemplateRequest) {
		return this.buildAndPost<CreateTemplateRequest>("CreateTemplateAppointment", request)
	}

	async DeleteTemplate(id: number) {
		return this.deleteRecord(id)
	}

	async GetTemplatesForWeekday(weekday: Weekday) {
		return this.buildAndGetData<TemplatesForWeekdayResponse, WeekdayRequest>("GetTemplatesForWeekday", { weekday })
	}
}
