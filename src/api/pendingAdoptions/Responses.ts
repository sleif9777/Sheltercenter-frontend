import { PendingAdoptionStatus } from "../../enums/PendingAdoptionEnums"
import { IPendingAdoption, PendingAdoptionSelectFieldOption } from "../../models/PendingAdoptionModels"

export type ActivePendingAdoptionsResponse = {
	adoptions: IPendingAdoption[]
}

export type PendingAdoptionSelectFieldOptionsResponse = {
	adoptions: PendingAdoptionSelectFieldOption[]
}

export type AdopterCurrentPendingAdoptionStatusResponse = {
	status: PendingAdoptionStatus | null
	readyToRollInstant: string | null
}
