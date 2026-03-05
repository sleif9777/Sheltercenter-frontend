import { APIBase } from "../APIBase"
import {
	ImportSpreadsheetBatchRequest,
	PrimaryEmailRequest,
	SaveUserFormRequest,
	UpdatePrimaryEmailRequest,
} from "./Requests"
import { ImportSpreadsheetBatchResponse, LogInResponse } from "./Responses"

export class UsersAPI extends APIBase {
	constructor() {
		super("UserProfiles")
	}

	async ImportSpreadsheetBatch(request: ImportSpreadsheetBatchRequest) {
		const formData = new FormData()
		formData.append("importFile", request.importFile!) // validated as part of form provider

		return this.buildAndPostFormData<ImportSpreadsheetBatchResponse>("ImportSpreadsheetBatch", formData)
	}

	async SaveUserForm(request: SaveUserFormRequest) {
		return this.buildAndPost<SaveUserFormRequest>("SaveUserForm", request)
	}

	async UpdatePrimaryEmail(request: UpdatePrimaryEmailRequest) {
		return this.buildAndPost<UpdatePrimaryEmailRequest>("UpdatePrimaryEmail", request)
	}

	async LogIn(request: PrimaryEmailRequest) {
		return this.buildAndGetFullResponse<LogInResponse, PrimaryEmailRequest>("LogIn", request)
	}

	async LogOut() {
		// TODO flesh
	}

	GetCurrentAuth(userID?: number) {
		const path = this.buildCommandPath("GetCurrentAuth")
		return this.post(path, { userID: userID })
	}

	AuthenticateOTP(email: string, otp: string) {
		const data = {
			email: email,
			otp: otp,
		}
		const path = this.buildCommandPath("AuthenticateOTP")

		return this.post(path, data)
	}

	// LogOut(userID: number) {
	//     const data = {
	//         userID: userID,
	//     }
	//     const path = this.buildCommandPath("LogOut")

	//     return this.post(path, data)
	// }

	GenerateOTP(email: string) {
		const data = {
			email: email,
		}
		const path = this.buildCommandPath("GenerateOTP")
		return this.post(path, data)
	}

	// ImportSpreadsheetBatch(batchFile: Blob) {
	//     const data = new FormData()
	//     data.append("batchFile", batchFile)

	//     const path = this.buildCommandPath("SpreadsheetImportBatch")

	//     return this.post(path, data)
	// }

	// SaveAdopterByForm(data: {}) {
	//     const path = this.buildCommandPath("SaveAdopterByForm")
	//     return this.post(path, data)
	// }

	// UpdatePrimaryEmail(data: {}) {
	//     const path = this.buildCommandPath("UpdatePrimaryEmail")
	//     return this.post(path, data)
	// }
}
