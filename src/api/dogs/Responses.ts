import { AdopterWatchlist, DashboardDogHash, DogHash, DogSelectFieldOption, IDog } from "../../models/DogModels"

export type DashboardsContextResponse = {
	hash: DashboardDogHash
}

export type DogDemographicsResponse = {
	dog: IDog
}

export type DogSelectFieldOptionsResponse = {
	options: DogSelectFieldOption[]
}

export type WatchlistContextResponse = {
	hash: DogHash
	lastImport: string
}

export type WatchlistResponse = {
	watchlist: AdopterWatchlist
}
