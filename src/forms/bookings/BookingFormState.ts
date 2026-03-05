import { ScheduleAppointmentWithPreferencesRequest } from "../../api/appointments/Requests"
import { StringUtils } from "../../utils/StringUtils"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type BookingFormFieldUpdater = FormFieldUpdateCallback<ScheduleAppointmentWithPreferencesRequest>

const initialState: ScheduleAppointmentWithPreferencesRequest = {
	activityLevel: undefined,
	adopterID: 0,
	adopterNotes: "",
	agePreference: undefined,
	apptID: 0,
	bringingDog: false,
	genderPreference: undefined,
	hasCats: false,
	hasDogs: false,
	hasFence: false,
	hasOtherPets: false,
	housingOwnership: undefined,
	housingType: undefined,
	internalNotes: "",
	lowShed: false,
	maxWeightPreference: 0,
	minWeightPreference: 0,
	mobility: false,
	otherPetsComment: "",
}

export const useBookingFormState = createFormState<ScheduleAppointmentWithPreferencesRequest>(initialState, {
	adopterID: [(s) => s.adopterID > 0 || "Must select an adopter"],
	apptID: [(s) => s.apptID > 0 || "Must select an appointment"],
	maxWeightPreference: [(s) => validateMaxWeight(s) || "Max weight must be more than min weight"],
	otherPetsComment: [(s) => !s.hasOtherPets || StringUtils.isNotNull(s.otherPetsComment) || "Comment required"],
})

function validateMaxWeight(state: ScheduleAppointmentWithPreferencesRequest) {
	return (
		state.maxWeightPreference == 0 ||
		state.minWeightPreference == 0 ||
		(state.maxWeightPreference ?? 0) >= (state.minWeightPreference ?? 0)
	)
}
