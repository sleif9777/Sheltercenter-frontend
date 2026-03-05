import { APIBase } from "../APIBase"
import { ISODateRequest } from "../appointments/Requests"

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
