import { AppointmentType } from "../enums/Enums";

export class AppointmentTypeFunctions {
    static isAdoptionAppointment(type: AppointmentType) {
        return [
            AppointmentType.ADULTS,
            AppointmentType.PUPPIES,
            AppointmentType.ALL_AGES,
            AppointmentType.FUN_SIZE
        ].includes(type)
    }
    
    static isAdminAppointment(type: AppointmentType) {
        return !this.isAdoptionAppointment(type)
    }
    
    static isPaperworkAppointment(type: AppointmentType) {
        return type === AppointmentType.PAPERWORK
    }
    
    static isNonPaperworkAdminAppointment(type: AppointmentType) {
        return this.isAdminAppointment(type) && !this.isPaperworkAppointment(type)
    }
    
    static isSurrenderAppointment(type: AppointmentType) {
        return type === AppointmentType.SURRENDER
    }
}
