import { AdopterApprovalStatus } from "../../enums/AdopterEnums"
import { UserFormContext } from "../../forms/users/UserFormState"

export type PrimaryEmailRequest = {
	primaryEmail: string
}

export type ImportSpreadsheetBatchRequest = {
	importFile: File | null
}

export type SaveUserFormRequest = {
	context: UserFormContext
	status: AdopterApprovalStatus
	firstName: string
	lastName: string
	internalNotes: string
} & PrimaryEmailRequest

export type UpdatePrimaryEmailRequest = {
	newEmail: string
} & PrimaryEmailRequest
