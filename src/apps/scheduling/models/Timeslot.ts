import { SimpleTimeslotDictionary, TimeslotDictionary } from "../components/Timeslot";
import { CalendarMode } from "../enums/Enums";
import { IAppointmentBase } from "./AppointmentBase";

export interface ITimeslot<T extends IAppointmentBase> {
    instant: Date,
    appointments: T[],
}

export class TimeslotConstructor<T extends IAppointmentBase> {
    setUpTimeslots(blocks: SimpleTimeslotDictionary<T>): TimeslotDictionary<T> {
        const newTimeslots: TimeslotDictionary<T> = []
        for (const time in blocks) {
            newTimeslots.push({
                appointments: blocks[time],
                mode: CalendarMode.TEMPLATE,
                instant: blocks[time][0].instant,
            })
        }

        return newTimeslots.sort((a, b) => (a.instant > b.instant) ? 1 : -1)
    }
}