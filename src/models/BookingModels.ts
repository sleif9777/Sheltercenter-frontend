import { BookingMessageTemplate } from "../enums/BookingEnums"
import { BookingAdopter } from "./AdopterModels"

export interface IBooking {
	bookedInstant: string
	adopter: BookingAdopter
	flags?: BookingMessageTemplate[]
}
