import { SecurityLevel } from "../enums/UserEnums"

export interface IUser {
	userID: number
	firstName: string
	lastName: string
	security: SecurityLevel
	adopterID?: number // blank for staff
	currentAppt?: {
		ID: number
		isoDate: string
		instantDisplay: string
	}
	restrictCalendar: boolean
}
