import { IAppointmentBase } from "./AppointmentBase";

export interface ITimeslot<T extends IAppointmentBase> {
    instant: moment.Moment,
    appointments: T[],
}