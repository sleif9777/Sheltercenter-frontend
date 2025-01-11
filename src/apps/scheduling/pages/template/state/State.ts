import { create } from "zustand"
import { TimeslotDictionary } from "../../../components/Timeslot";
import { IAppointmentBase } from "../../../models/AppointmentBase";
import { ITemplateAppointment, TemplateAppointment } from "../models/TemplateAppointment";
import { Weekday } from "../../../enums/Enums";

interface TemplateHomeState<T extends IAppointmentBase> {
    weekday: Weekday | undefined,
    setWeekday: (newWeekday: Weekday | undefined) => void,
    timeslots: TimeslotDictionary,
    // setTimeslots: (newTimeslots: TimeslotDictionary) => void,
}

export const useTemplateHomeState = create<TemplateHomeState<ITemplateAppointment>>((set) => ({
    weekday: Weekday.MONDAY,
    setWeekday: async (newWeekday) => {
        const newTimeslots = await TemplateAppointment.fetchAppointmentsForWeekday(newWeekday ?? Weekday.MONDAY)
        set(() => ({ 
            weekday: newWeekday ?? Weekday.MONDAY, 
            timeslots: TemplateAppointment.setUpTimeslots(newTimeslots) 
        }))
    },
    timeslots: [],
}));