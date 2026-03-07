import { AdopterWatchlist, DashboardDogHash, DogHash, IDog } from "../../models/DogModels"

export type DashboardsContextResponse = {
	hash: DashboardDogHash
}

export type DogDemographicsResponse = {
	dog: IDog
}

export type WatchlistContextResponse = {
	hash: DogHash
	lastImport: string
}

export type WatchlistResponse = {
	watchlist: AdopterWatchlist
}
