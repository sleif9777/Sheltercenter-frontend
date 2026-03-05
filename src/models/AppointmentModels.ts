import { AppointmentType, Outcome } from "../enums/AppointmentEnums"
import { AdopterContactInfo } from "./AdopterModels"
import { IBooking } from "./BookingModels"
import { ScheduleHash } from "./ScheduleHashModel"

export interface IAppointment {
	ID: number

	type: AppointmentType
	typeDisplay: string

	isoDate: string
	isoInstant: string
	weekday: number
	instantDisplay: string
	timeDisplay: string

	description: string

	locked: boolean
	softDeleted: boolean
	hasCurrentBooking: boolean
	isAdminAppt: boolean
	notes?: string

	outcome?: Outcome
	outcomeDisplay?: string
	chosenDog?: string

	checkInTime?: string
	checkOutTime?: string
	isInProgress: boolean
	clothingDescription?: string
	counselor?: string

	booking?: IBooking
}

export interface AppointmentIDProps extends Pick<IAppointment, "ID"> {}

export type AppointmentHash = ScheduleHash<HashAppointment>

export interface HashAppointment
	extends
		AppointmentIDProps,
		Pick<IAppointment, "hasCurrentBooking" | "isAdminAppt" | "checkInTime" | "checkOutTime" | "isInProgress"> {}

export interface AppointmentMissingOutcome extends AppointmentIDProps, Pick<IAppointment, "description" | "isoDate"> {}

export interface ReportingAppointment extends Pick<
	IAppointment,
	"ID" | "timeDisplay" | "description" | "type" | "typeDisplay"
> {}

export interface ReportingAdoptionAppointment
	extends
		ReportingAppointment,
		Pick<
			IAppointment,
			"checkInTime" | "checkOutTime" | "counselor" | "clothingDescription" | "outcomeDisplay" | "chosenDog"
		> {
	booking: IBooking
}

export interface ReportingAdminAppointment extends ReportingAppointment, Pick<IAppointment, "notes"> {}

export interface RecentAdoption {
	instant: string
	adopter: AdopterContactInfo
	dog: string
}
