import { AxiosResponse } from "axios"

import { API } from "../../../api/API"
import { IAdopterBase } from "../models/Adopter"

export namespace AdopterAPI {
    export interface GetRecentlyUploadedAdoptersRequest { 
		"lookbackDays": 1 | 2 | 3 | 5 | 10
	}

	export interface AdopterBaseResponse {
		adopters: IAdopterBase[]
	}
}

export class AdopterAPI extends API {
	constructor() {
		super("Adopters")
	}

	GetAdopter(id: number) {
		return this.getSingleItem(id)
	}

	GetAdopterDetail(id: number) {
		const path = this.buildCommandPath("GetAdopterDetail", { "forAdopter": id.toString() })
		return this.get(path)
	}

	GetAllAdopters() {
		const path = this.buildCommandPath("GetAllAdopters")
		return this.get(path)
	}

	GetAdoptersForBooking() {
		const path = this.buildCommandPath("GetAdoptersForBooking")
		return this.get(path)
	}

	async GetRecentlyUploadedAdopters(lookbackDays: 1 | 2 | 3 | 5 | 10): Promise<AxiosResponse<AdopterAPI.AdopterBaseResponse>> {
		return await this.buildAndGet<AdopterAPI.AdopterBaseResponse, { lookbackDays: number }>(
			"GetRecentlyUploadedAdopters",
			{ lookbackDays }
		)
	}

	MessageAdopter(data: { adopterID: number, subject: string, message: string }) {
		const path = this.buildCommandPath("MessageAdopter")
		return this.post(path, data)
	}

	ResendApproval(adopterID: number | string): Promise<AxiosResponse> {
		const data = {
			adopterID: adopterID
		}

		const path = this.buildCommandPath("ResendApproval")
		return this.post(path, data)
	}

	RestoreCalendarAccess(adopterID: number) {
		const data = {
			adopterID: adopterID
		}

		const path = this.buildCommandPath("RestoreCalendarAccess")
		return this.post(path, data)
	}
}