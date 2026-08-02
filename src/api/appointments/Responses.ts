import {
	AppointmentMissingOutcome,
	IAppointment,
	RecentAdoption,
	ReportingAppointment,
} from "../../models/AppointmentModels"
import { ScheduleContext } from "../../pages/schedule/ScheduleAppState"

export type ReportingPeriodStats = {
	total: number
	adoptions: number
	chosen: number
	fta: number
	no_decision: number
	no_show: number
	hw_positive: number
	hw_negative: number
	applications: number
	visitors: number
	adopters: number
}

export type ReportingStatsResponse = {
	periods: {
		ytd: ReportingPeriodStats
		pytd: ReportingPeriodStats
		prev_year: ReportingPeriodStats
		current_month: ReportingPeriodStats
		current_month_py: ReportingPeriodStats
	}
	global: {
		avg_visits_before_adopting: number
		visitors_never_adopted: number
	}
}

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
