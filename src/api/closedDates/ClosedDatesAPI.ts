import { APIBase } from "../APIBase"
import { ISODateRequest } from "../appointments/Requests"

// No Requests.ts or Responses.ts needed: both actions take a plain ISODateRequest (shared
// from appointments/Requests.ts) and return no response body beyond HTTP status.
export class ClosedDatesAPI extends APIBase {
	constructor() {
		super("ClosedDates")
	}

	async MarkDateAsClosed(isoDate: string) {
		return this.buildAndPost<ISODateRequest>("MarkDateAsClosed", { isoDate })
	}

	async UndoMarkDateAsClosed(isoDate: string) {
		return this.buildAndPost<ISODateRequest>("UndoMarkDateAsClosed", { isoDate })
	}
}
