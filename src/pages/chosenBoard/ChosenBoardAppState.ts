import { create } from "zustand"

import { IPendingAdoption } from "../../models/PendingAdoptionModels"
import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { ActivePendingAdoptionsResponse } from "../../api/pendingAdoptions/Responses"

export interface ChosenBoardContext {
	adoptions: IPendingAdoption[]
	refreshingAdoptions: boolean
}

interface ChosenBoardState extends ChosenBoardContext {
	refresh: () => void
}

export const useChosenBoardState = create<ChosenBoardState>((set) => ({
	adoptions: [],
	refreshingAdoptions: false,

	// eslint-disable-next-line sort-keys
	refresh: async () => {
		set(() => ({
			refreshingAdoptions: true,
		}))

		const resp: ActivePendingAdoptionsResponse = await new PendingAdoptionsAPI().GetActivePendingAdoptions()
		set(() => ({
			adoptions: resp.adoptions,
			refreshingAdoptions: false,
		}))
	},
}))
