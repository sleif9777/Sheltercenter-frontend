import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DashboardDogHash } from "../../models/DogModels"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { DashboardsContextResponse } from "../../api/dogs/Responses"
import { DateTime } from "../../utils/DateTime"

export enum DashboardMode {
	WHO_WENT_HOME,
	CHOSEN,
	FTA,
}

interface DashboardsAppState {
	dogHash: DashboardDogHash
	isRefreshing: boolean
	// ISO timestamp of the last successful refresh; persisted so a reload still shows how stale the data is.
	lastUpdated?: string
	lastRefreshFailed: boolean
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
			lastRefreshFailed: false,
			mode: DashboardMode.WHO_WENT_HOME,

			refresh: async () => {
				set(() => ({
					isRefreshing: true,
				}))

				// Keep the last good data on failure; the page shows when it was last updated.
				try {
					const resp: DashboardsContextResponse = await new DogsAPI().GetDashboardDogHash()
					set(() => ({
						dogHash: resp.hash,
						lastRefreshFailed: false,
						lastUpdated: new DateTime().instant.toISOString(),
					}))
				} catch {
					set(() => ({ lastRefreshFailed: true }))
				} finally {
					set(() => ({ isRefreshing: false }))
				}
			},
		}),
		{
			name: "dashboard-storage",
			partialize: (state) => ({
				dogHash: state.dogHash,
				lastUpdated: state.lastUpdated,
				mode: state.mode,
			}),
		}
	)
)
