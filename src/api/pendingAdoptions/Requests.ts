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
	dog: string
	circumstance: CircumstanceOptions
} & AdopterIDRequest

export type MarkStatusRequest = {
	status: PendingAdoptionStatus
	heartworm: boolean
	message?: string
} & AdoptionIDRequest
