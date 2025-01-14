import { create, useStore } from "zustand"
import { SimpleTimeslotDictionary, TimeslotDictionary } from "../../../components/Timeslot";
import { Appointment, IAppointment } from "../models/Appointment";
import { Weekday } from "../../../enums/Enums";
import { IAdopter } from "../../../../adopters/models/Adopter";
import { AdopterAPI } from "../../../../adopters/api/API";

export interface SchedulingHomeContext {
    viewDate: Date,
    appointments: SimpleTimeslotDictionary,
    missingOutcomes: IAppointment[]
    closedDateID: number | null,
    weekday: Weekday,
    emptyDates: Date[],
    userCurrentAppointment?: IAppointment,
    adoptersSansAppointment: IAdopter[],
}

interface SchedulingHomeState extends Omit<SchedulingHomeContext, "appointments"> {
    refresh: (newViewDate: Date, refreshAdopters: boolean, userID?: number) => void,
    timeslots: TimeslotDictionary
}

export const useSchedulingHomeState = create<SchedulingHomeState>((set) => ({
    viewDate: new Date(),
    closedDateID: null,
    refresh: async (newViewDate: Date, refreshAdopters: boolean = false, userID?: number) => {
        const context: SchedulingHomeContext = await Appointment.fetchAppointmentsForDate(newViewDate, userID ?? 0)
        set(() => ({ 
            viewDate: newViewDate, 
            timeslots: Appointment.setUpTimeslots(context.appointments ?? {}), 
            closedDateID: context.closedDateID,
            weekday: (newViewDate.getDay() == 0 ? 6 : newViewDate.getDay() - 1),
            emptyDates: context.emptyDates,
            missingOutcomes: context.missingOutcomes ?? [],
            userCurrentAppointment: context.userCurrentAppointment
        }))

        if (refreshAdopters) {
            const getAdoptions = await new AdopterAPI().GetAdoptersForBooking()
            set(() => ({ 
                adoptersSansAppointment: getAdoptions.data.adopters
            }))
        }
    },
    emptyDates: [],
    timeslots: [],
    weekday: (new Date().getDay() == 0 ? 6 : new Date().getDay() - 1),
    missingOutcomes: [],
    userCurrentAppointment: undefined,
    adoptersSansAppointment: []
}));