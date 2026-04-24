import { DogSex } from "../enums/DogEnums"

export interface IDog {
	ID: number
	shelterluvID: number
	name: string
	description: string
	photoURL: string
	ageMonths: number
	weight: number
	sex: DogSex
	breed: string
	funSize: boolean
	availableNow: boolean
	availableDate?: string
	unavailableDate?: string
	interestCount: number
}

export type DogSelectFieldOption = Pick<IDog, "ID" | "name">

export type HashDog = Pick<IDog, "ID" | "name" | "ageMonths" | "interestCount" | "weight">

export type DashboardDog = Pick<IDog, "ID" | "name" | "unavailableDate" | "photoURL">

export type WatchlistDog = Pick<IDog, "ID" | "name" | "ageMonths" | "funSize" | "availableDate" | "availableNow">

// Returns dog IDs only, load the dog individually
export type DogHash = {
	watching: {
		available: HashDog[]
		notAvailable: HashDog[]
	}
	notWatching: HashDog[]
}

export type DashboardDogHash = {
	chosen: {
		needsSN: DashboardDog[]
		needsWC: DashboardDog[]
		readyToRoll: DashboardDog[]
	}
	fta: DashboardDog[]
	newlyInHome: DashboardDog[]
}

export type AdopterWatchlist = WatchlistDog[]