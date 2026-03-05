import { AxiosResponse } from "axios"

import { APIBase } from "../APIBase"
import { ISODateRequest } from "../appointments/Requests"
import {
	AdopterIDRequest,
	AdopterPreferencesRequest,
	AdopterSelectFieldOptionsRequest,
	GetAdopterDirectoryListingRequest,
	GetRecentlyUploadedAdoptersRequest,
	SendMessageRequest,
} from "./Requests"
import {
	AdopterAlertsResponse,
	AdopterDemographicsResponse,
	AdopterDirectoryListingResponse,
	AdopterPreferencesResponse,
	AdopterSelectFieldOptionsResponse,
	RecentlyUploadedAdoptersResponse,
} from "./Responses"

export class AdoptersAPI extends APIBase {
	constructor() {
		super("Adopters")
	}

	async GetAdopterAlerts(isoDate: string) {
		return this.buildAndGetData<AdopterAlertsResponse, ISODateRequest>("GetAdopterAlerts", { isoDate })
	}

	async GetAdopterDirectoryListing(filterText: string, includeArchived: boolean = false) {
		return this.buildAndGetData<AdopterDirectoryListingResponse, GetAdopterDirectoryListingRequest>(
			"GetAdopterDirectoryListing",
			{ filterText, includeArchived }
		)
	}

	async GetAdopterSelectFieldOptions(includeScheduled: boolean, includeArchived: boolean) {
		return this.buildAndGetData<AdopterSelectFieldOptionsResponse, AdopterSelectFieldOptionsRequest>(
			"GetAdopterSelectFieldOptions",
			{ includeArchived, includeScheduled }
		)
	}

	async GetRecentlyUploadedAdopters(lookbackDays: 1 | 2 | 3 | 5 | 10) {
		return this.buildAndGetData<RecentlyUploadedAdoptersResponse, GetRecentlyUploadedAdoptersRequest>(
			"GetRecentlyUploadedAdopters",
			{ lookbackDays }
		)
	}

	async GetAdopterDemographics(adopterID: number) {
		return this.buildAndGetData<AdopterDemographicsResponse, AdopterIDRequest>("GetAdopterDemographics", {
			adopterID,
		})
	}

	async GetAdopterPreferences(adopterID: number) {
		return this.buildAndGetData<AdopterPreferencesResponse, AdopterIDRequest>("GetAdopterPreferences", {
			adopterID: adopterID,
		})
	}

	async MessageAdopter(request: SendMessageRequest) {
		return this.buildAndPost<SendMessageRequest>("MessageAdopter", request)
	}

	async MessageAdoptions(request: SendMessageRequest) {
		return this.buildAndPost<SendMessageRequest>("MessageAdoptions", request)
	}

	async ResendApproval(adopterID: number): Promise<AxiosResponse> {
		return this.buildAndPost<AdopterIDRequest>("ResendApproval", { adopterID })
	}

	async RestoreCalendarAccess(adopterID: number) {
		return this.buildAndPost<AdopterIDRequest>("RestoreCalendarAccess", { adopterID })
	}

	async UpdateAdopterPreferences(req: AdopterPreferencesRequest) {
		return this.buildAndPost<AdopterPreferencesRequest>("UpdateAdopterPreferences", req)
	}
}
