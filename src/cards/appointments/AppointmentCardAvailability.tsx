import { faCheck, faInfoCircle, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { useStore } from "zustand"

import { DogsAPI } from "../../api/dogs/DogsAPI"
import { CardItem, CardListSection } from "../../core/components/card/CardListSection"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { useSessionState } from "../../core/session/SessionState"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { Weekday } from "../../enums/TemplateEnums"
import { isAdoptionAppointment } from "../../forms/appointments/AppointmentForm"
import { IAppointment } from "../../models/AppointmentModels"
import { AdopterWatchlist } from "../../models/DogModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { DateTime } from "../../utils/DateTime"
import { unpackApptData } from "./Utils"

function Disclaimer({ text }: { text: string }) {
	return (
		<div className="my-1 rounded-sm border border-red-700 bg-red-100 px-1 text-left text-[13px] font-semibold text-red-700">
			<FontAwesomeIcon className="mr-1" icon={faInfoCircle} />
			{text}
		</div>
	)
}

export function AbleToMeet({ apptData }: { apptData: IAppointment }) {
	const schedule = useScheduleState(),
		session = useSessionState()

	const [watchlist, setWatchlist] = useState<AdopterWatchlist>()

	const fetchWatchlist = useCallback(async () => {
		if (!session.user?.adopterID) {
			return
		}

		const resp = await new DogsAPI().GetWatchlistForAdopter(session.user?.adopterID)
		setWatchlist(resp.watchlist)
	}, [session.user?.adopterID])

	useEffect(() => {
		fetchWatchlist()
	}, [fetchWatchlist])

	if (!isAdoptionAppointment(apptData.type)) {
		return
	}

	const { adults, funSize, puppies } = getAvailableTypes(apptData.type, schedule.dateUtil.GetWeekday())

	const unavailableDogs = getNotYetAvailableDogsFromWatchlist(watchlist ?? [], schedule.dateUtil, funSize, puppies, adults)

	const availableWatchlistDogs = (watchlist ?? []).filter((d) => d.availableNow)
	const allCanMeet = availableWatchlistDogs.length > 0 && unavailableDogs.length === 0
	const isSaturday = schedule.dateUtil.GetWeekday() === Weekday.SATURDAY
	const hasAdults = availableWatchlistDogs.some((d) => d.ageMonths > 6 && !d.funSize)

	return (
		<>
			<CardListSection
				items={[
					AbleToMeetItem({ canMeet: puppies, label: "Puppies" }),
					AbleToMeetItem({ canMeet: funSize, label: "Fun Size (est. adult size under 25 lbs)" }),
					AbleToMeetItem({ canMeet: adults, label: "Adults over 25 lbs." }),
				]}
				title="You Can Meet..."
			/>
			{unavailableDogs.length > 0 && (
				<Message level={MessageLevel.Warning} message={"These dogs will not be available to meet: " + unavailableDogs.join(", ")} />
			)}
			{allCanMeet && (
				<Message
					level={MessageLevel.Success}
					message={
						"All your watchlisted dogs should be available to meet." +
						(isSaturday && hasAdults ? " Note: larger adults may be out for host weekend on Saturdays." : "")
					}
				/>
			)}
		</>
	)
}

function AbleToMeetItem({ label, canMeet }: { label: string; canMeet: boolean }): CardItem<ReactNode> {
	return {
		node: (
			<span>
				<FontAwesomeIcon className="mr-2" icon={canMeet ? faCheck : faXmark} /> {label}
			</span>
		),
	}
}

export function SingleBookingDisclaimer() {
	return (
		<Disclaimer text="You may only have one appointment booked at a time. To book this appointment, cancel your current appointment first using the button at the top of this page." />
	)
}

export function LockedAppointmentDisclaimer({ apptData }: { apptData: IAppointment }) {
	const session = useStore(useSessionState)
	const { booking } = unpackApptData(apptData)

	if (booking || !session.adopterUser) {
		return
	}

	return <Disclaimer text="This appointment is restricted from open booking. If you are interested in this appointment, message us." />
}

export function getAvailableTypes(apptType: AppointmentType, weekday: Weekday) {
	let adults = false,
		funSize = false,
		puppies = false

	switch (apptType) {
		case AppointmentType.ADULTS:
			adults = true
			funSize = weekday >= Weekday.FRIDAY
			break
		case AppointmentType.PUPPIES:
			puppies = true
			break
		case AppointmentType.ALL_AGES:
			adults = true
			puppies = true
			funSize = weekday >= Weekday.FRIDAY
			break
		case AppointmentType.FUN_SIZE:
			funSize = true
			adults = true
	}

	return { adults, funSize, puppies }
}

export function getNotYetAvailableDogsFromWatchlist(
	watchlist: AdopterWatchlist,
	scheduleDateUtil: DateTime,
	funSize: boolean,
	puppies: boolean,
	adults: boolean
) {
	watchlist = watchlist.filter((dog) => dog.availableNow)

	let notYetAvailableDogs: string[] =
		watchlist?.filter((dog) => dog.availableDate && new DateTime(dog.availableDate).DiffWithDate(scheduleDateUtil) > 0).map((dog) => dog.name) ?? []

	if (!funSize) {
		const funSizeDogs: string[] = watchlist?.filter((dog) => dog.funSize).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(funSizeDogs)
	}

	if (!puppies) {
		const puppyDogs: string[] = watchlist?.filter((dog) => dog.ageMonths <= 6 && !dog.funSize).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(puppyDogs)
	}

	if (!adults) {
		const adultDogs: string[] = watchlist?.filter((dog) => dog.ageMonths > 6 && !dog.funSize).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(adultDogs)
	}

	return [...new Set(notYetAvailableDogs)].sort((a, b) => a.localeCompare(b))
}
