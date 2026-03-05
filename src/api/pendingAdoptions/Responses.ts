import { IPendingAdoption, PendingAdoptionSelectFieldOption } from "../../models/PendingAdoptionModels"

export type ActivePendingAdoptionsResponse = {
	adoptions: IPendingAdoption[]
}

export type PendingAdoptionSelectFieldOptionsResponse = {
	adoptions: PendingAdoptionSelectFieldOption[]
}
