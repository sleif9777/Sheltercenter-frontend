import { create } from "zustand"
import { SimpleTimeslotDictionary, TimeslotDictionary } from "../../../components/Timeslot";
import { Appointment, IAppointment } from "../models/Appointment";
import { Weekday } from "../../../enums/Enums";
import { IAdopter } from "../../../../adopters/models/Adopter";
import { AdopterAPI } from "../../../../adopters/api/API";
import { PendingAdoptionsAPI } from "../../../../pending_adoptions/api/API";
import { IPendingAdoption } from "../../../../pending_adoptions/models/PendingAdoption";
import { TimeslotConstructor } from "../../../models/Timeslot";

export interface SchedulingHomeContext {
    viewDate: Date,
    appointments: SimpleTimeslotDictionary<IAppointment>,
    missingOutcomes: IAppointment[]
    closedDateID: number | null,
    weekday: Weekday,
    emptyDates: Date[],
    userCurrentAppointment?: IAppointment,
    userExceptions: ("adoptionCompleted" | "requestedAccess" | "requestedSurrender")[]
    adoptersSansAppointment: IAdopter[],
    adoptionsSansPaperwork: IPendingAdoption[],
    adopterOptions?: IAdopter[]
}

interface SchedulingHomeState extends Omit<SchedulingHomeContext, "appointments"> {
    refresh: (newViewDate: Date, refreshObjs: ("adopters" | "adoptions")[], userID?: number) => void,
    timeslots: TimeslotDictionary<IAppointment>
}

export const useSchedulingHomeState = create<SchedulingHomeState>((set) => ({
    viewDate: new Date(),
    closedDateID: null,
    refresh: async (newViewDate: Date, refreshObjs: ("adopters" | "adoptions")[], userID?: number) => {
        if (refreshObjs.includes("adoptions")) {
            const getAdoptions = await new PendingAdoptionsAPI().GetAllPendingAdoptionsAwaitingPaperwork()
            set(() => ({ 
                adoptionsSansPaperwork: getAdoptions.data.adoptions
            }))
        }

        const context: SchedulingHomeContext = await Appointment.fetchAppointmentsForDate(newViewDate, userID ?? 0)

        set(() => ({ 
            viewDate: newViewDate, 
            timeslots: new TimeslotConstructor<IAppointment>().setUpTimeslots(context.appointments ?? {}),
            // timeslots: Timeslot().setUpTimeslots(context.appointments ?? {}), 
            closedDateID: context.closedDateID,
            weekday: (newViewDate.getDay() == 0 ? 6 : newViewDate.getDay() - 1),
            emptyDates: context.emptyDates,
            missingOutcomes: context.missingOutcomes ?? [],
            userCurrentAppointment: context.userCurrentAppointment,
            userExceptions: context.userExceptions,
        }))

        // TODO: Make a loading overlay and move this higher
        if (refreshObjs.includes("adopters")) {
            const getAdopters = await new AdopterAPI().GetAdoptersForBooking()
            set(() => ({ 
                adoptersSansAppointment: getAdopters.data.adopters
            }))
        }
    },
    emptyDates: [],
    timeslots: [],
    weekday: (new Date().getDay() == 0 ? 6 : new Date().getDay() - 1),
    missingOutcomes: [],
    userCurrentAppointment: undefined,
    adoptersSansAppointment: [],
    adoptionsSansPaperwork: [],
    userExceptions: []
}));