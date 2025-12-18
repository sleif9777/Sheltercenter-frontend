import { create } from "zustand"

import { TimeslotDictionary } from "../../../components/Timeslot";
import { Weekday } from "../../../enums/Enums";
import { ITemplateAppointment, TemplateAppointment } from "../models/TemplateAppointment";
import { TimeslotConstructor } from "../../../models/Timeslot";

interface TemplateHomeState {
    weekday: Weekday | undefined,
    setWeekday: (newWeekday: Weekday | undefined) => void,
    timeslots: TimeslotDictionary<ITemplateAppointment>,
}

export const useTemplateHomeState = create<TemplateHomeState>((set) => ({
    weekday: Weekday.MONDAY,
    setWeekday: async (newWeekday) => {
        const newTimeslots = await TemplateAppointment.fetchAppointmentsForWeekday(newWeekday ?? Weekday.MONDAY)
        set(() => ({ 
            weekday: newWeekday ?? Weekday.MONDAY, 
            timeslots: new TimeslotConstructor<ITemplateAppointment>().setUpTimeslots(newTimeslots) 
        }))
    },
    timeslots: [],
}));