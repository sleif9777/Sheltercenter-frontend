import { faCat, faDog, faHorse, faLock, faWheelchair, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { AppointmentCardDataResponse } from "../../api/appointments/Responses"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { useSessionState } from "../../core/session/SessionState"
import { Outcome } from "../../enums/AppointmentEnums"
import { IAppointment } from "../../models/AppointmentModels"
import { AppointmentCardActions } from "./AppointmentCardActions"
import { AbleToMeet, LockedAppointmentDisclaimer, SingleBookingDisclaimer } from "./AppointmentCardAvailability"
import { AboutSection, BookingInfoSection, SurrenderInfoSection } from "./AppointmentCardSections"
import { AppointmentCardContext, AppointmentCardProps } from "./Types"
import { getAppointmentCardTopDetails, unpackApptData } from "./Utils"

export function AppointmentCard({ apptID, context }: AppointmentCardProps) {
	const session = useSessionState()
	const [apptData, setApptData] = useState<IAppointment>()

	const fetchData = useCallback(async () => {
		if (!apptID) {
			return
		}

		try {
			const coreDataResp: AppointmentCardDataResponse = await new AppointmentsAPI().GetAppointmentCardData(apptID)
			if (!coreDataResp || !coreDataResp.cardData) {
				console.error("Invalid response from API for apptID:", apptID, coreDataResp)
				return
			}
			setApptData(coreDataResp.cardData)
		} catch (error) {
			console.error("Error fetching appointment data for apptID:", apptID, error)
		}
	}, [apptID])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	if (!apptData) {
		return <div>Loading appointment data...</div>
	}

	return (
		<StandardCard
			actions={<AppointmentCardActions appt={apptData} context={context} session={session} />}
			color={CardColor.GRAY}
			description={<AppointmentDescription apptData={apptData} context={context} />}
			hideTitleBorder={!apptData.hasCurrentBooking || !!apptData.checkOutTime || apptData.outcome == Outcome.NO_SHOW}
			twoColItems={getAppointmentCardTopDetails(apptData, session)}
		>
			{context == AppointmentCardContext.TIMESLOT && (
				<>
					{apptData.locked && <LockedAppointmentDisclaimer apptData={apptData} />}
					{session.user?.currentAppt?.ID && session.user?.currentAppt?.ID != apptID && <SingleBookingDisclaimer />}
					{session.adopterUser && !apptData.hasCurrentBooking && <AbleToMeet apptData={apptData} />}
				</>
			)}
			{!apptData.checkOutTime && apptData.outcome != Outcome.NO_SHOW && (
				<>
					<BookingInfoSection apptData={apptData} />
					<AboutSection apptData={apptData} />
					<SurrenderInfoSection apptData={apptData} />
				</>
			)}
		</StandardCard>
	)
}

interface AppointmentDescriptionProps {
	apptData: IAppointment
	context: AppointmentCardContext
}

export function AppointmentDescription({ context, apptData }: AppointmentDescriptionProps) {
	const { adopter } = unpackApptData(apptData)
	const session = useSessionState()

	const isOwnAppt = session.adopterUser && session.user?.currentAppt?.ID === apptData.ID
	const slotText = isOwnAppt ? "YOUR APPOINTMENT" : apptData.description

	return (
		<>
			<span className="whitespace-normal">{context == AppointmentCardContext.TIMESLOT ? slotText : apptData.instantDisplay}</span>
			<span className="ml-1.5 space-x-0.5 whitespace-nowrap">
				{apptData.locked && <Icon def={faLock} />}
				{adopter?.preferences.mobility && <TooltippedIcon icon={faWheelchair} tooltip="Mobility assistance requested" />}
				{adopter?.preferences.bringingDog && <TooltippedIcon icon={faDog} tooltip="Bringing dog" />}
				{adopter?.preferences.hasCats && <TooltippedIcon icon={faCat} tooltip="Has a cat" />}
				{adopter?.preferences.hasOtherPets && <TooltippedIcon icon={faHorse} tooltip={`Has other pets: ${adopter.preferences.otherPetsComment}`} />}
			</span>
		</>
	)
}

function Icon({ def }: { def: IconDefinition }) {
	return <FontAwesomeIcon icon={def} style={{ marginLeft: 5 }} />
}

function TooltippedIcon({ icon, tooltip }: { icon: IconDefinition; tooltip: string }) {
	return (
		<TooltipProvider tooltip={tooltip}>
			<FontAwesomeIcon icon={icon} />
		</TooltipProvider>
	)
}
