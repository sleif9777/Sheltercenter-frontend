import { API } from "../../../../../api/API"
import { IAppointment } from "../models/Appointment"

export class AppointmentsAPI extends API {
    constructor() {
        super("Appointments")
    }

    SoftDeleteAppointment(id: number) {
        const data = {
            appointmentID: id
        }
        const path = this.buildCommandPath("SoftDeleteAppointment")
        return this.post(path, data)
    }

    CheckInAppointment(data: {}) {
        const path = this.buildCommandPath("CheckInAppointment")
        return this.post(path, data)
    }

    CheckOutAppointment(data: {}) {
        const path = this.buildCommandPath("CheckOutAppointment")
        return this.post(path, data)
    }

    MarkNoShow(id: number) {
        const data = {
            appointmentID: id
        }
        const path = this.buildCommandPath("MarkNoShow")
        return this.post(path, data)
    }

    MarkTemplateSent(id: number, templateID: number) {
        const data = {
            appointmentID: id,
            templateID: templateID
        }
        const path = this.buildCommandPath("MarkTemplateSent")
        return this.post(path, data)
    }

    CancelAppointment(id: number) {
        const data = {
            appointmentID: id
        }
        const path = this.buildCommandPath("CancelAppointment")
        return this.post(path, data)
    }

    CreateBatchForDate(date: Date) {
        const data = {
            forDate: date,
        }
        const path = this.buildCommandPath("CreateBatchForDate")
        
        return this.post(path, data)
    }

    MarkDateAsClosed(date: Date) {
        const data = {
            date: date
        }
        const path = this.buildCommandPath("MarkDateAsClosed")

        return this.post(path, data)
    }

    GetContextForDate(date: Date, userID: number) {
        const params = {
            forDate: date.toISOString(),
            forUserID: userID?.toString() ?? ""
        }
        const path = this.buildCommandPath("GetContextForDate", params)

        return this.get(path)
    }

    CreateAppointment(data: Omit<IAppointment, "id" | "heartwormPositive">) {
        const path = this.buildCommandPath("CreateAppointment")
        return this.post(path, data)
    }

    ToggleLock(id: number) {
        const data = {
            appointmentID: id,
        }
        const path = this.buildCommandPath("ToggleLock")
        return this.post(path, data)
    }

    ToggleLockForAll(isUnlock: boolean, forDate: Date) {
        const data = {
            forDate: forDate,
            isUnlock: isUnlock
        }

        const path = this.buildCommandPath("ToggleLockForAll")

        return this.post(path, data)
    }

    GetAppointmentsMissingOutcomes() {
        const path = this.buildCommandPath("GetAppointmentsMissingOutcomes")
    
        return this.get(path)
    }

    GetDatesWithNoAppointments() {
        const path = this.buildCommandPath("GetDatesWithNoAppointments")

        return this.get(path)
    }

    ScheduleAppointment(data: {}) {
        const path = this.buildCommandPath("ScheduleAppointment")
        return this.post(path, data)
    }
}