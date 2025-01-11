import { IAppointmentBase } from "./AppointmentBase";

export interface ITimeslot {
    instant: moment.Moment,
    appointments: IAppointmentBase[],
}