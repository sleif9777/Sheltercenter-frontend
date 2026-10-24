import { AdopterIDRequest } from "../adopters/Requests"

export type DogIDRequest = {
	dogID: number
}

export type SetDashboardHiddenRequest = DogIDRequest & {
	hidden: boolean
}

export type ListModificationRequest = DogIDRequest & AdopterIDRequest
