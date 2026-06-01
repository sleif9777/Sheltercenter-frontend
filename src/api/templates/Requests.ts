import { TimeRequest } from "../../utils/DateTime"
import { Weekday } from "../../enums/TemplateEnums"

export type WeekdayRequest = {
	weekday: Weekday
}

export type CreateTemplateRequest = {
	type: number
} & WeekdayRequest &
	TimeRequest
