import { IUser } from "../../models/UserModels"

export type LogInResponse = {
	isAuthenticated: boolean
	user: IUser
	accessToken: string
	refreshToken: string
}

export type ImportSpreadsheetBatchResponse = {
	successes: number
	updates: number
	failures: number
	aversions: {
		ID: number
		name: string
	}[]
}
