import { HttpStatusCode } from "axios"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { IDashboardNote } from "../../models/DashboardNoteModels"
import { DashboardDog, DashboardDogHash } from "../../models/DogModels"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { DashboardsContextResponse } from "../../api/dogs/Responses"
import { DateTime } from "../../utils/DateTime"

export enum DashboardMode {
	WHO_WENT_HOME,
	CHOSEN,
	FTA,
	NOTES,
}

interface DashboardsAppState {
	dogHash: DashboardDogHash
	isRefreshing: boolean
	// ISO timestamp of the last successful refresh; persisted so a reload still shows how stale the data is.
	lastUpdated?: string
	lastRefreshFailed: boolean
	mode: DashboardMode
	notes: IDashboardNote[]
	refresh: () => void
	setDogHidden: (dogID: number, hidden: boolean) => Promise<boolean>
}

function withHidden(dogs: DashboardDog[], dogID: number, hidden: boolean): DashboardDog[] {
	return dogs.map((dog) => (dog.ID === dogID ? { ...dog, hidden } : dog))
}

function setHiddenInHash(hash: DashboardDogHash, dogID: number, hidden: boolean): DashboardDogHash {
	return {
		...hash,
		fta: withHidden(hash.fta, dogID, hidden),
		newlyInHome: withHidden(hash.newlyInHome, dogID, hidden),
	}
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
			notes: [],

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
						notes: resp.notes ?? [],
					}))
				} catch {
					set(() => ({ lastRefreshFailed: true }))
				} finally {
					set(() => ({ isRefreshing: false }))
				}
			},

			// Optimistic, so the icon responds immediately; reverted if the save fails. Resolves to whether it saved.
			setDogHidden: async (dogID: number, hidden: boolean) => {
				set((state) => ({ dogHash: setHiddenInHash(state.dogHash, dogID, hidden) }))
				// buildAndPost resolves with the error rather than rejecting, so check the status too.
				const saved = await new DogsAPI()
					.SetDashboardHidden(dogID, hidden)
					.then((resp) => resp?.status === HttpStatusCode.Ok)
					.catch(() => false)
				if (!saved) {
					set((state) => ({ dogHash: setHiddenInHash(state.dogHash, dogID, !hidden) }))
				}
				return saved
			},
		}),
		{
			name: "dashboard-storage",
			partialize: (state) => ({
				dogHash: state.dogHash,
				lastUpdated: state.lastUpdated,
				mode: state.mode,
				notes: state.notes,
			}),
		}
	)
)
