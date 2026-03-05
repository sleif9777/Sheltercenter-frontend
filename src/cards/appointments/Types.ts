import { SessionState } from "../../core/session/SessionState"
import { IAppointment } from "../../models/AppointmentModels"

export enum AppointmentCardContext {
	TIMESLOT,
	CURRENT_APPOINTMENT,
	ADOPTER_DETAIL,
}

export interface AppointmentCardProps {
	apptID: number
	context: AppointmentCardContext
}

export interface AppointmentCardActionProps {
	appt: IAppointment
	session: SessionState
}
