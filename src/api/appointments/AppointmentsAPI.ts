import { ReportingAppointment } from "../../models/AppointmentModels"
import { DateTime } from "../../utils/DateTime"
import { APIBase } from "../APIBase"
import {
	AppointmentIDRequest,
	CheckInAppointmentRequest,
	CheckOutAppointmentRequest,
	CreateAppointmentRequest,
	CreateWalkInRequest,
	GetScheduleContextRequest,
	ISODateRequest,
	MarkTemplateSentRequest,
	ScheduleAppointmentRequest,
	ToggleLockForDateRequest,
	ToggleLockForSingleApptRequest,
} from "./Requests"
import {
	AppointmentCardDataResponse,
	AppointmentsMissingOutcomesResponse,
	EmptyDatesResponse,
	RecentAdoptionsResponse,
	ReportingAppointmentResponse,
	ScheduleContextResponse,
} from "./Responses"

export class AppointmentsAPI extends APIBase {
	constructor() {
		super("Appointments")
	}

	/// SECTION: GET commands

	async GetAppointmentCardData(apptID: number) {
		return this.buildAndGetData<AppointmentCardDataResponse, AppointmentIDRequest>("GetAppointmentCardData", { apptID })
	}

	async GetAppointmentsMissingOutcomes() {
		return this.buildAndGetData<AppointmentsMissingOutcomesResponse, {}>("GetAppointmentsMissingOutcomes")
	}

	async GetContextForDate(date: DateTime, userID: number) {
		return this.buildAndGetFullResponse<ScheduleContextResponse, GetScheduleContextRequest>("GetContextForDate", {
			isoDate: date.GetISODate(),
			userID,
		})
	}

	async GetContinuityAccessSpreadsheet(isoDate: string) {
		const blob = await this.buildAndGetBlob<ISODateRequest>("GetContinuityAccessSpreadsheet", { isoDate })

		// Create download link
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement("a")

		link.href = url
		link.setAttribute("download", `schedule_export_${new DateTime().GetISODate()}.xlsx`)

		document.body.appendChild(link)

		link.click()
		link.remove()

		window.URL.revokeObjectURL(url)
	}

	async GetEmptyDates() {
		return this.buildAndGetData<EmptyDatesResponse, {}>("GetEmptyDates")
	}

	async GetRecentAdoptions() {
		return this.buildAndGetData<RecentAdoptionsResponse>("GetRecentAdoptions")
	}

	async GetReportingAppointment<T extends ReportingAppointment>(apptID: number) {
		return this.buildAndGetData<ReportingAppointmentResponse<T>, AppointmentIDRequest>("GetReportingAppointment", {
			apptID,
		})
	}

	/// SECTION: POST commands

	async CancelAllAndClose(isoDate: string) {
		return this.buildAndPost<ISODateRequest>("CancelAllAndClose", { isoDate })
	}

	async CancelAppointment(apptID: number) {
		return this.buildAndPost<AppointmentIDRequest>("CancelAppointment", { apptID })
	}

	async CheckInAppointment(request: CheckInAppointmentRequest) {
		return this.buildAndPost<CheckInAppointmentRequest>("CheckInAppointment", request)
	}

	async CheckOutAppointment(request: CheckOutAppointmentRequest) {
		return this.buildAndPost<CheckOutAppointmentRequest>("CheckOutAppointment", request)
	}

	async CreateAppointment(request: CreateAppointmentRequest) {
		return this.buildAndPost<CreateAppointmentRequest>("CreateAppointment", request)
	}

	async CreateBatchForDate(isoDate: string) {
		return this.buildAndPost<ISODateRequest>("CreateBatchForDate", { isoDate })
	}

	async CreateWalkIn(request: CreateWalkInRequest) {
		return this.buildAndPost<CreateWalkInRequest>("CreateWalkIn", request)
	}

	async MarkNoShow(apptID: number) {
		return this.buildAndPost<AppointmentIDRequest>("MarkNoShow", { apptID })
	}

	async MarkTemplateSent(apptID: number, templateID: number) {
		// TODO enum templateID
		return this.buildAndPost<MarkTemplateSentRequest>("MarkTemplateSent", { apptID, templateID })
	}

	async ScheduleAppointment(data: ScheduleAppointmentRequest) {
		return this.buildAndPost<ScheduleAppointmentRequest>("ScheduleAppointment", data)
	}

	async SoftDeleteAppointment(apptID: number) {
		return this.buildAndPost<AppointmentIDRequest>("SoftDeleteAppointment", { apptID })
	}

	async ToggleLockForDate(isoDate: string, isUnlock: boolean) {
		return this.buildAndPost<ToggleLockForDateRequest>("ToggleLockForDate", { isoDate, isUnlock })
	}

	async ToggleLockForSingleAppt(apptID: number, isUnlock: boolean) {
		return this.buildAndPost<ToggleLockForSingleApptRequest>("ToggleLockForSingleAppt", { apptID, isUnlock })
	}
}
