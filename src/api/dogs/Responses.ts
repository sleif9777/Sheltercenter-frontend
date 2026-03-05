import { AdopterWatchlist, DogHash, IDog } from "../../models/DogModels"

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
