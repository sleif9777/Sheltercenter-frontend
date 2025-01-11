export class DateTimeStrings {
    static getWeekday(dow: number): string {
        switch (dow) {
            case 0:
                return "Monday"
            case 1:
                return "Tuesday"
            case 2:
                return "Wednesday"
            case 3:
                return "Thursday"
            case 4:
                return "Friday"
            case 5:
                return "Saturday"
            case -1:
                return "Sunday"
            case 6:
                return "Sunday"
        }
        return ""
    }

    static getTime(date: Date): string {
        date.setHours(date.getHours())
        return date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
    }

    static getDaypart(instant: moment.Moment): string {
        return instant.hours() <= 11 ? "AM" : "PM"
    }
}