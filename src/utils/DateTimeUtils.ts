import moment from "moment-timezone"

type DateTimeFormat = "yyyy-MM-DD" | "M/D/YYYY h:mm A" | "MMM D, YYYY"

export class DateTime {
    instant: moment.Moment

    constructor(instant: Date) {
        this.instant = moment(instant).tz("America/New_York")
    }

    GetWeekday(): string {
        return this.instant.format("dddd")
    }

    GetDateKey(): string {
        return this.instant.toString().split("T")[0]
    }

    Format(f: DateTimeFormat) {
        return this.instant.format(f)
    }

    static IsSameDate(d1: DateTime, d2: DateTime) {
        return d1.GetDateKey() === d2.GetDateKey()
    }
}