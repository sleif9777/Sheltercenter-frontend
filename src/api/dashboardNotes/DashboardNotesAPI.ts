import { APIBase } from "../APIBase"
import { CreateDashboardNoteRequest, DashboardNoteIDRequest } from "./Requests"

// Notes are read with the rest of the dashboard in DogsAPI.GetDashboardDogHash.
export class DashboardNotesAPI extends APIBase {
	constructor() {
		super("DashboardNotes")
	}

	async CreateDashboardNote(req: CreateDashboardNoteRequest) {
		return this.buildAndPost<CreateDashboardNoteRequest>("CreateDashboardNote", req)
	}

	async DeleteDashboardNote(noteID: number) {
		return this.buildAndPost<DashboardNoteIDRequest>("DeleteDashboardNote", { noteID })
	}
}
