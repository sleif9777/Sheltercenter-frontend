import ReactQuill from "react-quill"

import { AdopterPreferences } from "../../models/AdopterModels"

export type AdopterIDRequest = {
	adopterID: number
}

export type SendMessageRequest = AdopterIDRequest & {
	subject: string
	message: ReactQuill.Value
	templateFlag?: number
}

export type GetRecentlyUploadedAdoptersRequest = {
	lookbackDays: 1 | 2 | 3 | 5 | 10
}

export type GetAdopterDirectoryListingRequest = {
	filterText: string
	includeArchived: boolean
}

export type AdopterSelectFieldOptionsRequest = {
	includeScheduled: boolean
	includeArchived: boolean
}

export type AdopterPreferencesRequest = Omit<AdopterPreferences, "applicationComments"> & AdopterIDRequest
