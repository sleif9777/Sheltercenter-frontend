import { create } from "zustand"
import { SimpleTimeslotDictionary, TimeslotDictionary } from "../../../components/Timeslot";
import { Appointment, IAppointment } from "../models/Appointment";
import { Weekday } from "../../../enums/Enums";
import { IAdopter } from "../../../../adopters/models/Adopter";
import { AdopterAPI } from "../../../../adopters/api/API";
import { PendingAdoptionsAPI } from "../../../../pending_adoptions/api/API";
import { IPendingAdoption } from "../../../../pending_adoptions/models/PendingAdoption";
import { TimeslotConstructor } from "../../../models/Timeslot";
import { AdopterFlag } from "../components/alerts/AdopterFlagsAlert";

export interface SchedulingHomeContext {
    viewDate: Date,
    weekday: Weekday,

    appointments: SimpleTimeslotDictionary<IAppointment>,
    closedDateID: number | null,

    adoptersSansAppointment: IAdopter[],
    adoptionsSansPaperwork: IPendingAdoption[],
    adopterOptions?: IAdopter[],

    emptyDates: Date[],
    missingOutcomes: IAppointment[],
    adopterFlags: AdopterFlag[],

    userCurrentAppointment?: IAppointment,
    userExceptions: ("adoptionCompleted" | "requestedAccess" | "requestedSurrender")[]
}

interface SchedulingHomeState extends Omit<SchedulingHomeContext, "appointments"> {
    timeslots: TimeslotDictionary<IAppointment>
    currentlyRefreshing: boolean,

    refresh: (newViewDate: Date, refreshObjs: ("adopters" | "adoptions")[], userID?: number) => void,
}

export const useSchedulingHomeState = create<SchedulingHomeState>((set) => ({
    viewDate: new Date(),
    weekday: (new Date().getDay() == 0 ? 6 : new Date().getDay() - 1),
    currentlyRefreshing: false,

    timeslots: [],
    closedDateID: null,

    adoptersSansAppointment: [],
    adoptionsSansPaperwork: [],
    
    emptyDates: [],
    missingOutcomes: [],
    adopterFlags: [],

    userCurrentAppointment: undefined,
    userExceptions: [],

    refresh: async (newViewDate: Date, refreshObjs: ("adopters" | "adoptions")[], userID?: number) => {
        set(() => ({
            currentlyRefreshing: true
        }))

        const context: SchedulingHomeContext = await Appointment.fetchAppointmentsForDate(newViewDate, userID ?? 0)

        set(() => ({ 
            viewDate: newViewDate, 
            weekday: (newViewDate.getDay() == 0 ? 6 : newViewDate.getDay() - 1),

            timeslots: new TimeslotConstructor<IAppointment>().setUpTimeslots(context.appointments ?? {}),
            closedDateID: context.closedDateID,

            emptyDates: context.emptyDates,
            missingOutcomes: context.missingOutcomes ?? [],
            adopterFlags: context.adopterFlags,

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

        if (refreshObjs.includes("adoptions")) {
            const getAdoptions = await new PendingAdoptionsAPI().GetAllPendingAdoptionsAwaitingPaperwork()
            set(() => ({ 
                adoptionsSansPaperwork: getAdoptions.data.adoptions
            }))
        }

        set(() => ({
            currentlyRefreshing: false
        }))
    },
}));