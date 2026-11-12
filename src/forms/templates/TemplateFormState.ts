import { Weekday } from "../../enums/TemplateEnums"
import { CreateTemplateRequest } from "../../api/templates/Requests"
import { createFormState, FormFieldUpdateCallback, Validator } from "../FormState"

export type TemplateFormFieldUpdater = FormFieldUpdateCallback<CreateTemplateRequest>

const initialState: CreateTemplateRequest = {
	hour: 0,
	minute: 0,
	type: 0,
	weekday: Weekday.MONDAY,
}

// Opening hours are only enforced in production so any time can be used when testing
const openingHoursRules: Validator<CreateTemplateRequest>[] = [
	(s) => s.weekday != Weekday.SUNDAY || "We are closed on Sundays",
	(s) => s.weekday != Weekday.THURSDAY || s.hour >= 13 || "We open at 1pm on Thursdays",
	(s) => s.weekday != Weekday.SATURDAY || s.hour <= 15 || "We close at 3pm on Saturdays",
]

export const useTemplateFormState = createFormState<CreateTemplateRequest>(initialState, {
	minute: [(s) => s.minute % 15 == 0 || "Must be scheduled in 15-minute increments"],
	weekday: import.meta.env.PROD ? openingHoursRules : [],
})
