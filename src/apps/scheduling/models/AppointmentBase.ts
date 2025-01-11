import moment from "moment";
import { AppointmentType, CalendarMode, PaperworkAppointmentSubtype } from "../enums/Enums";
import { SimpleTimeslotDictionary, TimeslotDictionary } from "../components/Timeslot";

export interface IAppointmentBase {
    id?: number;
    type: AppointmentType;
    subtype?: PaperworkAppointmentSubtype;
    instant: moment.Moment,
}

export abstract class AppointmentBase implements IAppointmentBase {
    id?: number | undefined
    type: AppointmentType
    subtype?: PaperworkAppointmentSubtype | undefined
    instant: moment.Moment

    constructor(dto: IAppointmentBase) {
        this.id = dto.id
        this.type = dto.type
        this.subtype = dto.subtype
        this.instant = dto.instant
    }

    getType(): string {
        switch (this.type) {
            case AppointmentType.ADULTS:
                return "Adults"
            case AppointmentType.ALL_AGES:
                return "All Ages"
            case AppointmentType.DONATION_DROP_OFF:
                return "Donation Drop-Off"
            case AppointmentType.PAPERWORK:
                return "Paperwork"
            case AppointmentType.PUPPIES:
                return "Puppies"
            case AppointmentType.SURRENDER:
                return "Surrender"
            case AppointmentType.VISIT:
                return "Visit"
            case AppointmentType.FUN_SIZE:
                return "Fun-Size"
        }
    }
    
    getAppointmentDescription(): string {
        return this.getType()
    }

    getTime(): string {
        return moment(this.instant).tz("America/New_York").format("h:mm A")
    }

    static compare(a: IAppointmentBase, b: IAppointmentBase): number {
        return (a.instant > b.instant) ? 0 : 1
    }

    static setUpTimeslots(blocks: SimpleTimeslotDictionary): TimeslotDictionary {
        const newTimeslots: TimeslotDictionary = []
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