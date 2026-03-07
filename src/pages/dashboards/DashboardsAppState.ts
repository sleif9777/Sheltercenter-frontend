import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DashboardDogHash } from "../../models/DogModels"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { DashboardsContextResponse } from "../../api/dogs/Responses"

export enum DashboardMode {
	WHO_WENT_HOME,
	CHOSEN,
	FTA,
}

interface DashboardsAppState {
	dogHash: DashboardDogHash
	isRefreshing: boolean
	mode: DashboardMode
	refresh: () => void
}

export const useDashboardsState = create<DashboardsAppState>()(
	persist(
		(set) => ({
			dogHash: {
				chosen: {
					needsSN: [],
					needsWC: [],
					readyToRoll: [],
				},
				fta: [],
				newlyInHome: [],
			},
			isRefreshing: false,
			mode: DashboardMode.WHO_WENT_HOME,

			refresh: async () => {
				set(() => ({
					isRefreshing: true,
				}))

				const resp: DashboardsContextResponse = await new DogsAPI().GetDashboardDogHash()
				set(() => ({
					dogHash: resp.hash,
					isRefreshing: false,
				}))
			},
		}),
		{
			name: "dashboard-storage",
			partialize: (state) => ({
				dogHash: state.dogHash,
				mode: state.mode,
			}),
		}
	)
)
