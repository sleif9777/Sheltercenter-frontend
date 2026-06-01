import { Outcome } from "../../enums/AppointmentEnums"
import { AdopterDemographics } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { ISODateDict, TimeRequest } from "../../utils/DateTime"
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
	Pick<IAppointment, "type"> &
	ISODateRequest &
	TimeRequest

export type ISODateRequest = ISODateDict

export type ToggleLockForDateRequest = ISODateDict & ToggleLockRequest

export type ToggleLockForSingleApptRequest = AppointmentIDRequest & ToggleLockRequest

export type GetScheduleContextRequest = UserIDRequest & ISODateRequest

export type MarkTemplateSentRequest = {
	templateID: number
} & AppointmentIDRequest

export type CreateAppointmentRequest = Pick<IAppointment, "type" | "locked" | "notes"> & {
	fka?: string
	pendingAdoptionID: number
} & ISODateRequest &
	TimeRequest

export type ScheduleAppointmentRequest = AppointmentIDRequest & AdopterIDRequest

export type ScheduleAppointmentWithPreferencesRequest = AdopterPreferencesRequest & ScheduleAppointmentRequest

export type CheckInAppointmentRequest = Pick<IAppointment, "clothingDescription" | "counselor"> & AppointmentIDRequest

export type CheckOutAppointmentRequest = {
	outcome: Outcome
	sendSleepoverInfo: boolean
	dogID?: string
} & AppointmentIDRequest
