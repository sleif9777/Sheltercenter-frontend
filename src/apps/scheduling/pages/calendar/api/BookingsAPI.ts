import { API } from "../../../../../api/API"

export class BookingsAPI extends API {
    constructor() {
        super("Bookings")
    }

    CreateNewBooking(data: {}) {
        const path = this.buildCommandPath("CreateNewBooking")
        return this.post(path, data)
    }
}