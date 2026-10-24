import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { IUser } from "../../models/UserModels"
import { useSessionState } from "./SessionState"

// Calendar access and the current appointment are loaded at login, but staff change both (restoring access,
// recording an outcome, rescheduling) while an adopter's tab sits open, so re-read them from the server
export async function syncAdopterSession(adopterID: number) {
	const resp = await new AdoptersAPI().GetCalendarRestrictionStatus(adopterID)
	const { patchUser, user } = useSessionState.getState()
	if (!user) return

	if (resp.restrictCalendar !== user.restrictCalendar) {
		patchUser({ restrictCalendar: resp.restrictCalendar })
	}

	// undefined (not null) means a backend that predates currentAppt in this response, so leave the session alone
	if (resp.currentAppt !== undefined && !isSameAppt(resp.currentAppt, user.currentAppt)) {
		patchUser({ currentAppt: resp.currentAppt ?? undefined })
	}
}

function isSameAppt(a: IUser["currentAppt"] | null, b: IUser["currentAppt"]) {
	return a?.ID === b?.ID && a?.isoInstant === b?.isoInstant
}
