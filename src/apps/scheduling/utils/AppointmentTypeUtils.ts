import { AppointmentType } from "../enums/Enums";

export function isAdoptionAppointment(type: AppointmentType) {
    return [
        AppointmentType.ADULTS,
        AppointmentType.PUPPIES,
        AppointmentType.ALL_AGES,
        AppointmentType.FUN_SIZE
    ].includes(type)
}

export function isAdminAppointment(type: AppointmentType) {
    return !isAdoptionAppointment(type)
}

export function isPaperworkAppointment(type: AppointmentType) {
    return type === AppointmentType.PAPERWORK
}

export function isNonPaperworkAdminAppointment(type: AppointmentType) {
    return isAdminAppointment(type) && !isPaperworkAppointment(type)
}