import { CircumstanceOptions, PendingAdoptionStatus } from "../../enums/PendingAdoptionEnums"
import { AdopterIDRequest } from "../adopters/Requests"

export type AdoptionIDRequest = {
	adoptionID: number
}

export type AddUpdateRequest = {
	message: string
	subject: string
} & AdoptionIDRequest

export type ChangeDogRequest = {
	newDog: string
} & AdoptionIDRequest

export type CreatePendingAdoptionRequest = {
	dogID: number
	circumstance: CircumstanceOptions
} & AdopterIDRequest

export type MarkHeartwormRequest = {
	heartworm: boolean
} & AdoptionIDRequest

export type MarkStatusRequest = {
	status: PendingAdoptionStatus
	message?: string
} & AdoptionIDRequest
