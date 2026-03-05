import { AppointmentType } from "../enums/AppointmentEnums"
import { Weekday } from "../enums/TemplateEnums"
import { ScheduleHash } from "./ScheduleHashModel"

export interface ITemplate {
	ID: number
	weekday: Weekday
	type: AppointmentType
	typeDisplay: string
}

export type TemplateHash = ScheduleHash<HashTemplate>

export interface HashTemplate extends Pick<ITemplate, "ID" | "typeDisplay"> {}
