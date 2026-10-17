import { NoDecisionEmailOption, Outcome } from "../../enums/AppointmentEnums"
import { CheckOutAppointmentRequest } from "../../api/appointments/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type CheckOutFormFields = CheckOutAppointmentRequest & {
	// Form-only: whether the second dog fields are in use
	hasSecondDog: boolean
	// Form-only: whether this appointment already has a second dog saved
	hasExistingSecondDog: boolean
}

export type CheckOutFormFieldUpdater = FormFieldUpdateCallback<CheckOutFormFields>

const initialState: CheckOutFormFields = {
	apptID: 0,
	hasExistingSecondDog: false,
	hasSecondDog: false,
	noDecisionEmailOption: NoDecisionEmailOption.WITH_SLEEPOVER,
	outcome: Outcome.ADOPTION,
}

export function isDogChoiceOutcome(outcome?: Outcome | null) {
	return outcome != null && [Outcome.ADOPTION, Outcome.FTA, Outcome.CHOSEN].includes(outcome)
}

/** The second dog option is offered for dog-choice outcomes, or to keep a saved second dog when the first falls through. */
export function canHaveSecondDog(s: CheckOutFormFields) {
	return isDogChoiceOutcome(s.outcome) || (s.outcome === Outcome.NO_DECISION && s.hasExistingSecondDog)
}

export function sendsSecondDog(s: CheckOutFormFields) {
	return s.hasSecondDog && canHaveSecondDog(s)
}

export function toCheckOutRequest(s: CheckOutFormFields): CheckOutAppointmentRequest {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { hasSecondDog, hasExistingSecondDog, secondOutcome, secondDogID, ...request } = s

	return sendsSecondDog(s) ? { ...request, secondDogID, secondOutcome } : { ...request, secondDogID: null, secondOutcome: null }
}

export const useCheckOutFormState = createFormState<CheckOutFormFields>(initialState, {
	apptID: [(s) => s.apptID > 0 || "Must select an appointment"],
	dogID: [(s) => s.outcome >= Outcome.NO_DECISION || (s.dogID ?? "").length > 0 || "Must select a dog for adoption/chosen/FTA outcome"],
	secondDogID: [
		(s) => !sendsSecondDog(s) || (s.secondDogID ?? "").length > 0 || "Must select the second dog",
		(s) => !sendsSecondDog(s) || s.secondDogID !== s.dogID || "Must be a different dog than the first",
	],
	secondOutcome: [(s) => !sendsSecondDog(s) || isDogChoiceOutcome(s.secondOutcome) || "Must select an outcome for the second dog"],
})
