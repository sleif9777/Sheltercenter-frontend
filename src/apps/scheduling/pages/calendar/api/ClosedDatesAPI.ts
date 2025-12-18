import { API } from "../../../../../api/API"

export class ClosedDatesAPI extends API {
    constructor() {
        super("ClosedDates")
    }

    MarkDateAsClosed(date: Date) {
        const data = { 
            date: date 
        }
        const path = this.buildCommandPath("MarkDateAsClosed")
        return this.post(path, data)
    }
}