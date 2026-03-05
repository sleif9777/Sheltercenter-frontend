import { AdopterIDRequest } from "../adopters/Requests"

export type DogIDRequest = {
	dogID: number
}

export type ListModificationRequest = DogIDRequest & AdopterIDRequest
