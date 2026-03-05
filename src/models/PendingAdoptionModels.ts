import { CircumstanceOptions, PendingAdoptionStatus } from "../enums/PendingAdoptionEnums"
import { AdopterDemographics } from "./AdopterModels"

export type PendingAdoptionUpdate = {
	instant: string
}

export interface IPendingAdoption {
	ID: number

	dog: string
	adopter: AdopterDemographics
	description: string

	status: PendingAdoptionStatus
	circumstance: CircumstanceOptions

	readyToRollInstant?: string
	heartwormPositive: boolean
	updates?: PendingAdoptionUpdate[]
	created: string
}

export interface PendingAdoptionSelectFieldOption extends Pick<IPendingAdoption, "ID" | "description"> {}
