import {
	ActivityLevel,
	AdopterApprovalStatus,
	AgePreference,
	GenderPreference,
	HousingOwnership,
	HousingType,
} from "../enums/AdopterEnums"
import { AdopterWatchlist } from "./DogModels"

export type BookingHistory = {
	adopted: number
	completed: number
	noShow: number
	noDecision: number
}

export type AdopterAlert = {
	name: string
	alerts: string[]
}

export interface IAdopter {
	ID: number

	primaryEmail: string
	firstName: string
	lastName: string

	fullName: string
	disambiguatedName: string

	status: AdopterApprovalStatus
	statusDisplay: string
	lastUploaded: string

	// USER PROFILE ITEMS
	streetAddress?: string
	city?: string
	state?: string
	postalCode?: string
	phoneNumber?: string
	userID: number

	// APPLICATION ITEMS
	shelterluvAppID?: string
	shelterluvID?: string
	approvedUntil: Date

	// HOUSING ENVIRONMENT ITEMS
	housingOwnership?: HousingOwnership
	housingType?: HousingType
	activityLevel?: ActivityLevel
	hasFence: boolean
	dogsInHome: boolean
	catsInHome: boolean
	otherPetsInHome: boolean
	otherPetsComment?: string

	// NOTES ITEMS
	applicationComments?: string
	internalNotes?: string
	adopterNotes?: string

	// ADOPTER PREFERENCE ITEMS
	genderPreference?: GenderPreference
	agePreference?: AgePreference
	genderPreferenceDisplay?: string
	agePreferenceDisplay?: string
	minWeightPreference?: number
	maxWeightPreference?: number
	lowShed: boolean

	// VISIT LOGISTICS ITEMS
	mobility: boolean
	bringingDog: boolean

	// SECURITY ITEMS
	restrictedCalendar: boolean

	approvedUntilISO: string
	approvalExpired: boolean
	bookingHistory: BookingHistory

	hasCats: boolean
	hasDogs: boolean
	hasOtherPets: boolean
}

export interface AdopterSelectFieldOption extends Pick<IAdopter, "ID" | "disambiguatedName"> {}

export interface RecentlyUploadedAdopter extends Pick<
	IAdopter,
	"ID" | "primaryEmail" | "disambiguatedName" | "statusDisplay" | "lastUploaded"
> {}

export interface AdopterContactInfo extends Pick<
	IAdopter,
	| "ID"
	| "firstName"
	| "lastName"
	| "primaryEmail"
	| "streetAddress"
	| "city"
	| "state"
	| "postalCode"
	| "shelterluvAppID"
> {}

export interface AdopterDemographics
	extends
		AdopterContactInfo,
		Pick<
			IAdopter,
			| "internalNotes"
			| "phoneNumber"
			| "status"
			| "approvedUntilISO"
			| "approvalExpired"
			| "restrictedCalendar"
			| "bookingHistory"
		> {}

export interface AdopterPreferences extends Pick<
	IAdopter,
	| "genderPreference"
	| "agePreference"
	| "activityLevel"
	| "bringingDog"
	| "lowShed"
	| "hasCats"
	| "hasDogs"
	| "hasFence"
	| "hasOtherPets"
	| "housingOwnership"
	| "housingType"
	| "maxWeightPreference"
	| "minWeightPreference"
	| "mobility"
	| "otherPetsComment"
	| "adopterNotes"
	| "internalNotes"
	| "applicationComments"
> {}

export interface BookingAdopter {
	demographics: AdopterDemographics
	preferences: AdopterPreferences
	watchlist: AdopterWatchlist
}

export interface DirectoryAdopter extends Pick<IAdopter, "ID" | "primaryEmail" | "fullName" | "status"> {}
