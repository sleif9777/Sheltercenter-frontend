import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type WatchlistHelpFormFieldUpdater = FormFieldUpdateCallback<WatchlistHelpFields>

export type WatchlistHelpFields = {
	acknowledgedNoHolds: boolean
	acknowledgedSoleResp: boolean
}

const initialState: WatchlistHelpFields = {
	acknowledgedNoHolds: false,
	acknowledgedSoleResp: false,
}

export const useWatchlistHelpFormState = createFormState<WatchlistHelpFields>(initialState)
