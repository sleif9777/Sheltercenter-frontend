import { afterEach, describe, expect, it } from "vitest"

import { NoDecisionEmailOption, Outcome } from "../../enums/AppointmentEnums"
import { canHaveSecondDog, CheckOutFormFields, toCheckOutRequest, useCheckOutFormState } from "./CheckOutFormState"

function fields(overrides: Partial<CheckOutFormFields> = {}): CheckOutFormFields {
	return {
		apptID: 7,
		dogID: "1",
		hasExistingSecondDog: false,
		hasSecondDog: true,
		noDecisionEmailOption: NoDecisionEmailOption.NO_EMAIL,
		outcome: Outcome.CHOSEN,
		secondDogID: "2",
		secondOutcome: Outcome.ADOPTION,
		...overrides,
	}
}

describe("CheckOutFormState", () => {
	afterEach(() => useCheckOutFormState.getState().reset())

	it("sends the second dog and drops form-only fields", () => {
		expect(toCheckOutRequest(fields())).toEqual({
			apptID: 7,
			dogID: "1",
			noDecisionEmailOption: NoDecisionEmailOption.NO_EMAIL,
			outcome: Outcome.CHOSEN,
			secondDogID: "2",
			secondOutcome: Outcome.ADOPTION,
		})
	})

	it("sends nulls when the second dog is unchecked so the backend removes it", () => {
		const request = toCheckOutRequest(fields({ hasSecondDog: false }))

		expect(request.secondDogID).toBeNull()
		expect(request.secondOutcome).toBeNull()
	})

	it("only offers a second dog for dog-choice outcomes or to keep a saved one", () => {
		expect(canHaveSecondDog(fields({ outcome: Outcome.FTA }))).toBe(true)
		expect(canHaveSecondDog(fields({ outcome: Outcome.NO_SHOW }))).toBe(false)
		expect(canHaveSecondDog(fields({ outcome: Outcome.NO_DECISION }))).toBe(false)
		expect(canHaveSecondDog(fields({ hasExistingSecondDog: true, outcome: Outcome.NO_DECISION }))).toBe(true)

		const request = toCheckOutRequest(fields({ dogID: undefined, outcome: Outcome.NO_SHOW }))
		expect(request.secondDogID).toBeNull()
	})

	it("requires a different second dog and a dog-choice outcome", () => {
		const { setAll } = useCheckOutFormState.getState()

		setAll(fields({ secondDogID: "1" }))
		expect(useCheckOutFormState.getState().errors.secondDogID).toEqual(["Must be a different dog than the first"])

		setAll(fields({ secondDogID: "" }))
		expect(useCheckOutFormState.getState().errors.secondDogID).toEqual(["Must select the second dog"])

		setAll(fields({ secondDogID: "2", secondOutcome: undefined }))
		expect(useCheckOutFormState.getState().errors.secondOutcome).toEqual(["Must select an outcome for the second dog"])

		setAll(fields({ hasSecondDog: false, secondDogID: "", secondOutcome: undefined }))
		expect(useCheckOutFormState.getState().isValid).toBe(true)
	})
})
