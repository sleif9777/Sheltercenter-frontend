import { PendingAdoptionStatus } from "../../enums/PendingAdoptionEnums"
import { APIBase } from "../APIBase"
import { AddUpdateRequest, ChangeDogRequest, CreatePendingAdoptionRequest, MarkStatusRequest } from "./Requests"
import { ActivePendingAdoptionsResponse, PendingAdoptionSelectFieldOptionsResponse } from "./Responses"

export class PendingAdoptionsAPI extends APIBase {
	constructor() {
		super("PendingAdoptions")
	}

	async AddUpdate(adoptionID: number, message: string, subject: string) {
		return this.buildAndPost<AddUpdateRequest>("AddUpdate", { adoptionID, message, subject })
	}

	async ChangeDog(request: ChangeDogRequest) {
		return this.buildAndPost<ChangeDogRequest>("ChangeDog", request)
	}

	async CreatePendingAdoption(request: CreatePendingAdoptionRequest) {
		return this.buildAndPost<CreatePendingAdoptionRequest>("CreatePendingAdoption", request)
	}

	async GetActivePendingAdoptions() {
		return this.buildAndGetData<ActivePendingAdoptionsResponse>("GetActivePendingAdoptions")
	}

	async GetPendingAdoptionSelectFieldOptions() {
		return this.buildAndGetData<PendingAdoptionSelectFieldOptionsResponse>("GetPendingAdoptionSelectFieldOptions")
	}

	async MarkStatus(adoptionID: number, status: PendingAdoptionStatus, heartworm: boolean = false, message?: string) {
		return this.buildAndPost<MarkStatusRequest>("MarkStatus", { adoptionID, heartworm, message, status })
	}
}
