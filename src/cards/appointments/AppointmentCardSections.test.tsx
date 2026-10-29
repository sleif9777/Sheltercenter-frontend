import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ActivityLevel, GenderPreference } from "../../enums/AdopterEnums"
import { AdopterPreferences } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { AdopterSetupSection } from "./AppointmentCardSections"

function appt(preferences: Partial<AdopterPreferences>, watchlist: { name: string }[] = []) {
	return {
		booking: { adopter: { preferences, watchlist } },
		hasCurrentBooking: true,
	} as unknown as IAppointment
}

describe("AdopterSetupSection", () => {
	it("links to both pages when nothing is filled in", () => {
		render(<AdopterSetupSection apptData={appt({ genderPreference: GenderPreference.NO_PREFERENCE })} />)

		expect(screen.getByRole("link", { name: "Add My Preferences" })).toHaveAttribute("href", "/preferences/")
		expect(screen.getByRole("link", { name: "Add My Watchlist" })).toHaveAttribute("href", "/watchlist/")
	})

	it("only links to what is still missing", () => {
		render(<AdopterSetupSection apptData={appt({ activityLevel: ActivityLevel.LOW })} />)

		expect(screen.queryByRole("link", { name: "Add My Preferences" })).not.toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Add My Watchlist" })).toBeInTheDocument()
	})

	it("shows nothing once both are filled in", () => {
		const { container } = render(<AdopterSetupSection apptData={appt({ hasFence: true }, [{ name: "Biscuit" }])} />)

		expect(container).toBeEmptyDOMElement()
	})
})
