import { ReactNode } from "react"

import { CardItem } from "../../core/components/card/CardListSection"
import { SessionState } from "../../core/session/SessionState"
import { AdopterPreferences, BookingAdopter } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { StringUtils } from "../../utils/StringUtils"

export function unpackApptData(apptData: IAppointment) {
	const booking = apptData.booking
	const adopter = apptData.booking?.adopter

	return { adopter, booking }
}

export function getCanViewBookingForm(appt: IAppointment, session: SessionState): boolean {
	if (session.adopterUser) {
		return appt.booking?.adopter.demographics.ID == session.user?.userID
	} else if (session.greeterUser) {
		return !appt.hasCurrentBooking
	} else if (session.adminUser) {
		return !appt.checkInTime
	}

	return false
}

export function getAppointmentCardTopDetails(apptData: IAppointment, session: SessionState): CardItem<ReactNode>[] {
	const { booking } = unpackApptData(apptData)

	if (!booking) {
		return session.adopterUser ? [] : [{ node: "(" + apptData.typeDisplay + ")" }]
	}

	return [
		{ node: "(" + apptData.typeDisplay + ")" },
		{
			node: "Checked out " + apptData.checkOutTime,
			showIf: StringUtils.isNotNull(apptData.checkOutTime),
		},
		{
			node: "Checked in " + apptData.checkInTime,
			showIf: StringUtils.isNotNull(apptData.checkInTime) && StringUtils.isNull(apptData.checkOutTime),
		},
		{
			node: apptData.clothingDescription + (apptData.counselor ? ` (${apptData.counselor})` : ""),
			showIf:
				StringUtils.isNotNull(apptData.checkInTime) &&
				StringUtils.isNotNull(apptData.clothingDescription) &&
				StringUtils.isNull(apptData.checkOutTime),
		},
		{
			node: getAdopterVisitCount(booking.adopter),
			showIf: !session.adopterUser,
		},
		{
			node: apptData.outcomeDisplay,
			showIf: session.adminUser,
		},
	]
}

export function getAdopterVisitCount(adopter: BookingAdopter, shortForm: boolean = false) {
	const count = adopter.demographics.bookingHistory.completed + 1

	// ordinal suffix
	const suffix =
		count % 100 >= 11 && count % 100 <= 13
			? "th"
			: count % 10 === 1
				? "st"
				: count % 10 === 2
					? "nd"
					: count % 10 === 3
						? "rd"
						: "th"

	// exclamations: 3rd visit -> "!", 4th -> "!!", up to 6th+ -> "!!!!"
	const exclamations = count > 2 ? "!".repeat(Math.min(count - 2, 4)) : ""

	return `${count}${suffix}${shortForm ? "" : " visit"}${exclamations}`
}

export function getPetsInHomeListing(preferences: AdopterPreferences): string {
	const pets: string[] = []

	if (preferences.hasDogs) {
		pets.push("dogs")
	}

	if (preferences.hasCats) {
		pets.push("cats")
	}

	if (preferences.hasOtherPets && preferences.otherPetsComment && preferences.otherPetsComment.length > 0) {
		pets.push(preferences.otherPetsComment)
	}

	return pets.join(", ")
}

export function getWeightPreferenceListing(preferences: AdopterPreferences): string | undefined {
	if (preferences.minWeightPreference && !preferences.maxWeightPreference) {
		return "Prefers over " + preferences.minWeightPreference + " lbs."
	}

	if (preferences.maxWeightPreference && !preferences.minWeightPreference) {
		return "Prefers under " + preferences.maxWeightPreference + " lbs."
	}

	if (preferences.minWeightPreference && preferences.maxWeightPreference) {
		return "Prefers between " + preferences.minWeightPreference + " and " + preferences.maxWeightPreference + " lbs."
	}

	return
}
