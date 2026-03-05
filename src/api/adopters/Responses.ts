import {
	AdopterAlert,
	AdopterDemographics,
	AdopterPreferences,
	AdopterSelectFieldOption,
	DirectoryAdopter,
	RecentlyUploadedAdopter,
} from "../../models/AdopterModels"

export type AdopterSelectFieldOptionsResponse = {
	options: AdopterSelectFieldOption[]
}

export type RecentlyUploadedAdoptersResponse = {
	adopters: RecentlyUploadedAdopter[]
}

export type AdopterDemographicsResponse = {
	demo: AdopterDemographics
	apptID?: number
}

export type AdopterPreferencesResponse = {
	pref: AdopterPreferences
}

export type AdopterDirectoryListingResponse = {
	adopters: DirectoryAdopter[]
}

export type AdopterAlertsResponse = {
	alerts: AdopterAlert[]
}
