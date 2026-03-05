import { AxiosError } from "axios"
import { create } from "zustand"

import { useSessionState } from "../../core/session/SessionState"
import { DogHash } from "../../models/DogModels"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { DateTime } from "../../utils/DateTime"
import { WatchlistContextResponse } from "../../api/dogs/Responses"

export type WatchlistContext = {
	dogHash?: DogHash
	lastImport: DateTime
}

export interface WatchlistState extends WatchlistContext {
	failedLoadResp?: AxiosError
	loadingWatchlist: boolean
	watchlistLoadFailed: boolean
	refresh: () => void
}

export const useWatchlistState = create<WatchlistState>((set) => {
	return {
		lastImport: new DateTime(),
		loadingWatchlist: false,
		watchlistLoadFailed: false,

		// eslint-disable-next-line sort-keys
		refresh: async () => {
			const session = useSessionState.getState()

			if (!session.user) {
				return
			}

			try {
				set({
					loadingWatchlist: true,
				})

				let resp: WatchlistContextResponse

				if (session.user.adopterID) {
					resp = await new DogsAPI().GetWatchlistHashForAdopter(session.user.adopterID)
				} else {
					resp = await new DogsAPI().GetPublishableDogs()
				}

				// Success (we only get here if status is 2xx)
				set({
					dogHash: resp.hash,
					lastImport: new DateTime(resp.lastImport),
					loadingWatchlist: false,
				})
			} catch (error) {
				// Strongly type the error
				if (error instanceof AxiosError) {
					set({
						failedLoadResp: error,
						loadingWatchlist: false,
						watchlistLoadFailed: true,
					})
				} else {
					// Network error or other non-Axios issue
					set({
						failedLoadResp: undefined,
						loadingWatchlist: false,
						watchlistLoadFailed: true,
					})
				}
			}
		},
	}
})
