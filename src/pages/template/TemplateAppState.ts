import { create } from "zustand"

import { Weekday } from "../../enums/TemplateEnums"
import { TemplateHash } from "../../models/TemplateModels"
import { TemplatesForWeekdayResponse } from "../../api/templates/Responses"
import { TemplatesAPI } from "../../api/templates/TemplatesAPI"

export interface TemplateState {
	templateHash?: TemplateHash[]
	weekday: Weekday
	loadingTemplates: boolean
	hashLoadFailed: boolean
	refresh: (newWeekday?: Weekday) => void
}

export const useTemplateState = create<TemplateState>((set, get) => {
	return {
		hashLoadFailed: false,
		loadingTemplates: false,
		weekday: Weekday.MONDAY,

		// eslint-disable-next-line sort-keys
		refresh: async (newWeekday?: Weekday) => {
			const currentWeekday = newWeekday ?? get().weekday

			// Update state FIRST
			set({
				loadingTemplates: true,
				weekday: currentWeekday,
			})

			try {
				// Fetch using the SAME date
				const context: TemplatesForWeekdayResponse = await new TemplatesAPI().GetTemplatesForWeekday(currentWeekday)

				// Apply results
				set({
					hashLoadFailed: false,
					loadingTemplates: false,
					templateHash: context.templateHash,
				})
			} catch {
				set({
					hashLoadFailed: true,
					loadingTemplates: false,
				})
			}
		},
	}
})
