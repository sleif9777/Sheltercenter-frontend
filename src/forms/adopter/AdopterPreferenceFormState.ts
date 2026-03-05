import { AdopterPreferencesRequest } from "../../api/adopters/Requests"
import { StringUtils } from "../../utils/StringUtils"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type AdopterPreferencesFormFieldUpdater = FormFieldUpdateCallback<AdopterPreferencesRequest>

const initialState: AdopterPreferencesRequest = {
	activityLevel: undefined,
	adopterID: 0,
	adopterNotes: "",
	agePreference: undefined,
	bringingDog: false,
	genderPreference: undefined,
	hasCats: false,
	hasDogs: false,
	hasFence: false,
	hasOtherPets: false,
	housingOwnership: undefined,
	housingType: undefined,
	lowShed: false,
	maxWeightPreference: 0,
	minWeightPreference: 0,
	mobility: false,
	otherPetsComment: "",
}

export const useAdopterPreferenceFormState = createFormState<AdopterPreferencesRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must select an adopter"],
	maxWeightPreference: [(s) => validateMaxWeight(s) || "Max weight must be more than min weight"],
	otherPetsComment: [(s) => !s.hasOtherPets || StringUtils.isNotNull(s.otherPetsComment) || "Comment required"],
})

function validateMaxWeight(state: AdopterPreferencesRequest) {
	return (
		state.maxWeightPreference == 0 ||
		state.minWeightPreference == 0 ||
		(state.maxWeightPreference ?? 0) >= (state.minWeightPreference ?? 0)
	)
}
