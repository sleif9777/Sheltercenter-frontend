import { AdopterIDRequest } from "../adopters/Requests"
import { APIBase } from "../APIBase"
import { DogIDRequest, ListModificationRequest } from "./Requests"
import {
	DashboardsContextResponse,
	DogDemographicsResponse,
	DogSelectFieldOptionsResponse,
	WatchlistContextResponse,
	WatchlistResponse,
} from "./Responses"

export class DogsAPI extends APIBase {
	constructor() {
		super("Dogs")
	}

	async GetDashboardDogHash() {
		return this.buildAndGetData<DashboardsContextResponse>("GetDashboardDogHash")
	}

	async GetDogDemographics(dogID: number) {
		return this.buildAndGetData<DogDemographicsResponse, DogIDRequest>("GetDogDemographics", { dogID })
	}

	async GetDogSelectFieldOptions() {
		return this.buildAndGetData<DogSelectFieldOptionsResponse>("GetDogSelectFieldOptions")
	}

	async GetPublishableDogs() {
		return this.buildAndGetData<WatchlistContextResponse>("GetPublishableDogs")
	}

	async GetWatchlistForAdopter(adopterID: number) {
		return this.buildAndGetData<WatchlistResponse, AdopterIDRequest>("GetWatchlistForAdopter", { adopterID })
	}

	async GetWatchlistHashForAdopter(adopterID: number) {
		return this.buildAndGetData<WatchlistContextResponse, AdopterIDRequest>("GetWatchlistHashForAdopter", { adopterID })
	}

	async AddDogToList(adopterID: number, dogID: number) {
		return this.buildAndPost<ListModificationRequest>("AddDogToList", { adopterID, dogID })
	}

	async RemoveDogFromList(adopterID: number, dogID: number) {
		return this.buildAndPost<ListModificationRequest>("RemoveDogFromList", { adopterID, dogID })
	}
}
