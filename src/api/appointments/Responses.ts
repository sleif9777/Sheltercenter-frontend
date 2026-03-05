import {
	AppointmentMissingOutcome,
	IAppointment,
	RecentAdoption,
	ReportingAppointment,
} from "../../models/AppointmentModels"
import { ScheduleContext } from "../../pages/schedule/ScheduleAppState"

export type ScheduleContextResponse = ScheduleContext

export type AppointmentCardDataResponse = {
	cardData: IAppointment
}

export type AppointmentsMissingOutcomesResponse = {
	appts: AppointmentMissingOutcome[]
}

export type EmptyDatesResponse = {
	emptyDates: string[]
}

export type ReportingAppointmentResponse<T extends ReportingAppointment> = {
	apptData: T
}

export type RecentAdoptionsResponse = {
	adoptions: RecentAdoption[]
}
