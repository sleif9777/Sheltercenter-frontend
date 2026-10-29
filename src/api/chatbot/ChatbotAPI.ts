import { APIBase } from "../APIBase"
import { AdopterIDRequest } from "../adopters/Requests"
import { AskRequest, InteractionIDRequest } from "./Requests"
import { ChatbotStatusResponse } from "./Responses"

export class ChatbotAPI extends APIBase {
	constructor() {
		super("Chatbot")
	}

	async GetStatus(adopterID: number) {
		return this.buildAndGetData<ChatbotStatusResponse, AdopterIDRequest>("GetStatus", { adopterID })
	}

	async Ask(req: AskRequest) {
		return this.buildAndPost<AskRequest>("Ask", req)
	}

	async SendToStaff(interactionID: number) {
		return this.buildAndPost<InteractionIDRequest>("SendToStaff", { interactionID })
	}

	async AcceptOffer(interactionID: number) {
		return this.buildAndPost<InteractionIDRequest>("AcceptOffer", { interactionID })
	}
}
