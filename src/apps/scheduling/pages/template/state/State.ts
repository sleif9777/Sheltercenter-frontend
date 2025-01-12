import { create } from "zustand"

import { TimeslotDictionary } from "../../../components/Timeslot";
import { Weekday } from "../../../enums/Enums";
import { TemplateAppointment } from "../models/TemplateAppointment";

interface TemplateHomeState {
    weekday: Weekday | undefined,
    setWeekday: (newWeekday: Weekday | undefined) => void,
    timeslots: TimeslotDictionary,
}

export const useTemplateHomeState = create<TemplateHomeState>((set) => ({
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