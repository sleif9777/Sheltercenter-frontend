export enum AppointmentType {
    ADULTS,
    PUPPIES,
    ALL_AGES,
    PAPERWORK,
    SURRENDER,
    VISIT,
    DONATION_DROP_OFF,
    FUN_SIZE
}

export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

// export function typeCount() {
//     return Object.keys(AppointmentType).length / 2
// }

export enum PaperworkAppointmentSubtype {
    ADOPTION,
    FTA
}

// export function subtypeCount() {
//     return Object.keys(PaperworkAppointmentSubtype).length / 2
// } 

export enum CalendarMode {
    SCHEDULING,
    TEMPLATE
}