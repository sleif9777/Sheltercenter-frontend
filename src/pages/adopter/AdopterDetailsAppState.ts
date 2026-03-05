import { create } from "zustand"

import { AdopterDemographics } from "../../models/AdopterModels"
import { AdopterDemographicsResponse } from "../../api/adopters/Responses"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AdopterApprovalStatus } from "../../enums/AdopterEnums"

export interface AdopterDetailsContext {
	apptID?: number
	demo: AdopterDemographics
}

interface AdopterDetailsState extends AdopterDetailsContext {
	refresh: (adopterID?: number) => void
}

export const useAdopterDetailsState = create<AdopterDetailsState>((set, get) => ({
	demo: {
		approvalExpired: true,
		approvedUntilISO: "",
		bookingHistory: {
			adopted: 0,
			completed: 0,
			noDecision: 0,
			noShow: 0,
		},
		firstName: "Loading",
		ID: 0,
		lastName: "Loading...",
		primaryEmail: "Loading...",
		restrictedCalendar: true,
		status: AdopterApprovalStatus.APPROVED,
	},

	refresh: async (adopterID) => {
		const { demo } = get()

		if (!adopterID && !demo.ID) {
			return
		}

		const resp: AdopterDemographicsResponse = await new AdoptersAPI().GetAdopterDemographics(adopterID ?? demo.ID)
		set(() => ({
			apptID: resp.apptID,
			demo: resp.demo,
		}))
	},
}))
