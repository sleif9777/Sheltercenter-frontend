import { Weekday } from "../../enums/TemplateEnums"

export type WeekdayRequest = {
	weekday: Weekday
}

export type CreateTemplateRequest = {
	hour: number
	minute: number
	type: number
} & WeekdayRequest
