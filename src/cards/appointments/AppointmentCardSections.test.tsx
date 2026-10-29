import { render, screen } from "@testing-library/react"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSessionState } from "../../core/session/SessionState"
import { ActivityLevel, GenderPreference } from "../../enums/AdopterEnums"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { SecurityLevel } from "../../enums/UserEnums"
import { AdopterPreferences } from "../../models/AdopterModels"
import { makeLogInResponse } from "../../test/fixtures"
import { AppointmentCard } from "./AppointmentCard"
import { AdopterSetupSection, hasPreferences } from "./AppointmentCardSections"
import { AppointmentCardContext } from "./Types"

// Card data the way the backend sends it to an adopter: never any booking details, even for their own
const ADOPTER_CARD_DATA = {
	ID: 37200,
	hasCurrentBooking: true,
	instantDisplay: "Nov 04, 05:30 PM",
	instant: "2026-11-04T17:30:00-05:00",
	locked: false,
	type: AppointmentType.ALL_AGES,
}

function respondWith(pref: Partial<AdopterPreferences>, watchlist: { name: string }[], cardData = ADOPTER_CARD_DATA) {
	vi.spyOn(axios, "get").mockImplementation(async (url: string) => {
		if (url.includes("GetAdopterPreferences")) return { data: { pref }, status: 200 }
		if (url.includes("GetWatchlistForAdopter")) return { data: { watchlist }, status: 200 }
		if (url.includes("GetAppointmentCardData")) return { data: { cardData }, status: 200 }
		return { data: {}, status: 200 }
	})
}

describe("hasPreferences", () => {
	it("ignores unset and no-preference values", () => {
		expect(hasPreferences({ genderPreference: GenderPreference.NO_PREFERENCE })).toBe(false)
	})

	it("counts a Low activity level, which is stored as 0", () => {
		expect(hasPreferences({ activityLevel: ActivityLevel.LOW })).toBe(true)
	})
})

describe("AdopterSetupSection", () => {
	beforeEach(() => {
		useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.ADOPTER))
	})

	it("links to both pages when nothing is filled in", async () => {
		respondWith({}, [])
		render(<AdopterSetupSection />)

		expect(await screen.findByRole("link", { name: "Add My Preferences" })).toHaveAttribute("href", "/preferences/")
		expect(screen.getByRole("link", { name: "Add My Watchlist" })).toHaveAttribute("href", "/watchlist/")
	})

	it("only links to what is still missing", async () => {
		respondWith({ hasFence: true }, [])
		render(<AdopterSetupSection />)

		expect(await screen.findByRole("link", { name: "Add My Watchlist" })).toBeInTheDocument()
		expect(screen.queryByRole("link", { name: "Add My Preferences" })).not.toBeInTheDocument()
	})

	it("shows nothing when a lookup fails", async () => {
		vi.spyOn(axios, "get").mockRejectedValue(new Error("down"))
		const { container } = render(<AdopterSetupSection />)

		await vi.waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2))
		expect(container).toBeEmptyDOMElement()
	})

	it("appears on the adopter's own card, which has no booking details", async () => {
		respondWith({}, [])
		render(<AppointmentCard apptID={37200} context={AppointmentCardContext.CURRENT_APPOINTMENT} />)

		expect(await screen.findByRole("link", { name: "Add My Preferences" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Add My Watchlist" })).toBeInTheDocument()
	})
})
