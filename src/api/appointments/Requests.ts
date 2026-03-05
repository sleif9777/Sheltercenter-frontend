import { Outcome } from "../../enums/AppointmentEnums"
import { AdopterDemographics, IAdopter } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { ISODateDict } from "../../utils/DateTime"
import { AdopterIDRequest, AdopterPreferencesRequest } from "../adopters/Requests"

export type AppointmentIDRequest = {
	apptID: number
}

export type UserIDRequest = {
	userID?: number
}

export type ToggleLockRequest = {
	isUnlock: boolean
}

export type CreateWalkInRequest = {
	adopterID: number | "*"
} & Pick<AdopterDemographics, "firstName" | "lastName" | "primaryEmail"> &
	Pick<IAppointment, "type">

export type ISODateRequest = ISODateDict

export type ToggleLockForDateRequest = ISODateDict & ToggleLockRequest

export type ToggleLockForSingleApptRequest = AppointmentIDRequest & ToggleLockRequest

export type GetScheduleContextRequest = UserIDRequest & ISODateRequest

export type MarkTemplateSentRequest = {
	templateID: number
} & AppointmentIDRequest

export type CreateAppointmentRequest = Pick<IAppointment, "type" | "locked" | "notes"> & {
	hour: number
	minute: number
	fka?: string
	pendingAdoptionID: number
} & ISODateRequest

export type ScheduleAppointmentRequest = AppointmentIDRequest & AdopterIDRequest

export type ScheduleAppointmentWithPreferencesRequest = AdopterPreferencesRequest & ScheduleAppointmentRequest

export type CheckInAppointmentRequest = Pick<IAppointment, "clothingDescription" | "counselor"> &
	AppointmentIDRequest &
	Pick<IAdopter, "streetAddress" | "city" | "state" | "postalCode">

export type CheckOutAppointmentRequest = {
	outcome: Outcome
	sendSleepoverInfo: boolean
	dog?: string
} & AppointmentIDRequest
