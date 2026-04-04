import {
	faCat,
	faCheck,
	faDog,
	faHorse,
	faInfoCircle,
	faLock,
	faWheelchair,
	faXmark,
	IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { useStore } from "zustand"

import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { CardItem, CardListSection } from "../../core/components/card/CardListSection"
import { CardTableSection } from "../../core/components/card/CardTableSection"
import { ValueLabelPair } from "../../core/components/formInputs/SelectInput"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import {
	ActivityLevelLabel,
	AgePreference,
	AgePreferenceLabel,
	GenderPreference,
	GenderPreferenceLabel,
	HousingOwnershipLabel,
	HousingTypeLabel,
} from "../../enums/AdopterEnums"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { BookingMessageTemplate } from "../../enums/BookingEnums"
import { EnumLabel } from "../../enums/EnumLabel"
import { Weekday } from "../../enums/TemplateEnums"
import { isAdoptionAppointment } from "../../forms/appointments/AppointmentForm"
import { MessageForm, QuickText, WildcardDefaults } from "../../forms/users/MessageForm"
import { AdopterDemographics } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { AppointmentCardDataResponse } from "../../api/appointments/Responses"
import { AppointmentCardActions } from "./AppointmentCardActions"
import { createQuickTexts } from "./MessageTemplates"
import { AppointmentCardContext, AppointmentCardProps } from "./Types"
import { getAppointmentCardTopDetails, getPetsInHomeListing, getWeightPreferenceListing, unpackApptData } from "./Utils"
import { AdopterWatchlist } from "../../models/DogModels"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { DateTime } from "../../utils/DateTime"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { StringUtils } from "../../utils/StringUtils"

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
			hideTitleBorder={!apptData.hasCurrentBooking || !!apptData.checkOutTime}
			twoColItems={getAppointmentCardTopDetails(apptData, session)}
		>
			{context == AppointmentCardContext.TIMESLOT && (
				<>
					{apptData.locked && <LockedAppointmentDisclaimer apptData={apptData} />}
					{session.user?.currentAppt?.ID && session.user?.currentAppt?.ID != apptID && <SingleBookingDisclaimer />}
					{session.adopterUser && !apptData.hasCurrentBooking && <AbleToMeet apptData={apptData} />}
				</>
			)}
			{!apptData.checkOutTime && (
				<>
					<BookingInfoSection apptData={apptData} />
					<AboutSection apptData={apptData} />
				</>
			)}
		</StandardCard>
	)
}

function QuickTextItem({
	qt,
	adopterFirstName,
	adopterID,
	apptID,
	templateFlags,
	wildcardDefaults,
}: {
	qt: QuickText
	adopterFirstName: string
	adopterID: number
	apptID: number
	templateFlags: BookingMessageTemplate[]
	wildcardDefaults: WildcardDefaults
}) {
	const modalState = useModalState()
	const alreadySent = templateFlags.includes(qt.value)

	return (
		<>
			<Modal modalState={modalState} modalTitle={"Message " + adopterFirstName}>
				<MessageForm
					adopterID={adopterID}
					apptID={apptID}
					hideSubject
					initialValue={qt.templateContent}
					initialWildcardValues={wildcardDefaults?.[qt.value as BookingMessageTemplate] ?? {}}
					modalState={modalState}
					templateFlag={qt.value}
				/>
			</Modal>
			<TooltipProvider tooltip={alreadySent ? "This template was already sent" : ""}>
				<button
					className={
						"cursor-pointer hover:bg-gray-300 disabled:cursor-auto disabled:bg-transparent disabled:text-gray-500 disabled:line-through"
					}
					disabled={alreadySent}
					onClick={modalState.open}
				>
					{qt.label}
				</button>
			</TooltipProvider>
		</>
	)
}

interface AppointmentDescriptionProps {
	apptData: IAppointment
	context: AppointmentCardContext
}

export function AppointmentDescription({ context, apptData }: AppointmentDescriptionProps) {
	const { adopter } = unpackApptData(apptData)

	return (
		<>
			{context == AppointmentCardContext.TIMESLOT ? apptData.description : apptData.instantDisplay}
			<span className="ml-1.5 space-x-0.5 whitespace-nowrap">
				{apptData.locked && <Icon def={faLock} />}
				{adopter?.preferences.mobility && <TooltippedIcon icon={faWheelchair} tooltip="Mobility assistance requested" />}
				{adopter?.preferences.bringingDog && <TooltippedIcon icon={faDog} tooltip="Bringing dog" />}
				{adopter?.preferences.hasCats && <TooltippedIcon icon={faCat} tooltip="Has a cat" />}
				{adopter?.preferences.hasOtherPets && (
					<TooltippedIcon icon={faHorse} tooltip={`Has other pets: ${adopter.preferences.otherPetsComment}`} />
				)}
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

	const unavailableDogs = getNotYetAvailableDogsFromWatchlist(
		watchlist ?? [],
		schedule.dateUtil,
		funSize,
		puppies,
		adults
	)

	return (
		<>
			<CardListSection
				items={[
					AbleToMeetItem({ canMeet: puppies, label: "Puppies (Any Size)" }),
					AbleToMeetItem({ canMeet: funSize, label: "Fun Size (Adults 20 lbs. and under)" }),
					AbleToMeetItem({ canMeet: adults, label: "Adults over 20 lbs." }),
				]}
				title="You Can Meet..."
			/>
			{unavailableDogs.length > 0 && (
				<Message
					level={MessageLevel.Warning}
					message={"These dogs will not be available to meet: " + unavailableDogs.join(", ")}
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
	return <Disclaimer text="You may only have one appointment booked at a time." />
}

export function LockedAppointmentDisclaimer({ apptData }: { apptData: IAppointment }) {
	const session = useStore(useSessionState)
	const { booking } = unpackApptData(apptData)

	if (booking || !session.adopterUser) {
		return
	}

	return (
		<Disclaimer text="This appointment is restricted from open booking. If you are interested in this appointment, message us." />
	)
}

export function BookingInfoSection({ apptData }: { apptData: IAppointment }) {
	const { adopter } = unpackApptData(apptData),
		session = useSessionState()

	if (!apptData.hasCurrentBooking || !adopter) {
		return
	}

	return (
		<>
			<ContactInfoSection demographics={adopter.demographics} />
			<NotesSection apptData={apptData} />
			<WatchlistSection apptData={apptData} />
			{session.adminUser && <MessageSection apptData={apptData} />}
		</>
	)
}

function ContactInfoSection({ demographics }: { demographics: AdopterDemographics }) {
	const items = [{ node: demographics.primaryEmail }, { node: demographics.phoneNumber }]

	return <CardListSection items={items} showBorder title="Contact Info" />
}

function NotesSection({ apptData }: { apptData: IAppointment }) {
	const session = useStore(useSessionState)
	const { adopter } = unpackApptData(apptData)

	if (!adopter) {
		return
	}

	const allNotes: ValueLabelPair<string | undefined>[] = [
		{
			label: "From " + adopter.demographics.firstName,
			value: adopter.preferences.adopterNotes,
		},
	]

	if (adopter.demographics.bookingHistory.completed < 2) {
		allNotes.push({
			label: "From Shelterluv",
			value: adopter.preferences.applicationComments,
		})
	}

	if (session.adminUser) {
		allNotes.push({
			label: "From Adoptions",
			value: adopter.demographics.internalNotes,
		})
	}

	const notesToShow = allNotes.filter((n) => (n.value ?? "").length > 0)

	return <CardTableSection items={notesToShow} showBorder title={notesToShow.length > 0 ? "Notes" : "No Notes"} />
}

export function AboutSection({ apptData }: { apptData: IAppointment }) {
	const { booking, adopter } = unpackApptData(apptData)

	if (!booking || !adopter) {
		return
	}

	const items: CardItem<ReactNode>[] = [
		{ node: `Booked ${booking.bookedInstant}` },
		{
			node: (
				<EnumLabel
					appendText=" activity household"
					labelMap={ActivityLevelLabel}
					value={adopter.preferences.activityLevel}
				/>
			),
		},
		{
			node: `From ${adopter.demographics.city}, ${adopter.demographics.state}`,
			showIf: Boolean(adopter.demographics.city && adopter.demographics.state),
		},
		{
			node: (
				<>
					<EnumLabel labelMap={HousingTypeLabel} value={adopter.preferences.housingType} />
					<EnumLabel
						appendText=")"
						labelMap={HousingOwnershipLabel}
						prependText=" ("
						value={adopter.preferences.housingOwnership}
					/>
				</>
			),
		},
		{
			node: "Has fence",
			showIf: adopter.preferences.hasFence,
		},
		{
			node: (
				<EnumLabel
					hidden={adopter.preferences.genderPreference == GenderPreference.NO_PREFERENCE}
					labelMap={GenderPreferenceLabel}
					lowercase
					prependText="Only interested in "
					value={adopter.preferences.genderPreference}
				/>
			),
		},
		{
			node: (
				<EnumLabel
					hidden={adopter.preferences.agePreference == AgePreference.NO_PREFERENCE}
					labelMap={AgePreferenceLabel}
					lowercase
					prependText="Only interested in "
					value={adopter.preferences.agePreference}
				/>
			),
		},
		{
			node: "Pets in home: " + getPetsInHomeListing(adopter.preferences),
			showIf: adopter.preferences.hasCats || adopter.preferences.hasDogs || adopter.preferences.hasOtherPets,
		},
		{
			node: getWeightPreferenceListing(adopter.preferences),
			showIf: !!adopter.preferences.minWeightPreference || !!adopter.preferences.maxWeightPreference,
		},
	]

	return <CardListSection items={items} title={"About " + adopter?.demographics.firstName} />
}

export function MessageSection({ apptData }: { apptData: IAppointment }) {
	const { booking, adopter } = unpackApptData(apptData),
		session = useSessionState(),
		schedule = useScheduleState()

	if (!adopter || apptData.outcome || session.greeterUser) {
		return
	}

	const { funSize, puppies, adults } = getAvailableTypes(apptData.type, schedule.dateUtil.GetWeekday())
	const notYetAvailableDogs = getNotYetAvailableDogsFromWatchlist(
		adopter.watchlist,
		schedule.dateUtil,
		funSize,
		puppies,
		adults
	)
	const noLongerAvailableDogs = adopter.watchlist
		.filter((d) => !d.availableNow)
		.map((d) => d.name)
		.sort((a, b) => a.localeCompare(b))

	const wildcardDefaults: WildcardDefaults = {
		[BookingMessageTemplate.DOGS_WERE_ADOPTED]: {
			"$$$DOG NAME HERE$$$": StringUtils.oxfordJoin(noLongerAvailableDogs),
		},
		[BookingMessageTemplate.DOGS_NOT_HERE_YET]: {
			"$$$DOG NAME HERE$$$": StringUtils.oxfordJoin(notYetAvailableDogs),
		},
	}

	const signature = session.user?.firstName + " " + session.user?.lastName
	const quickTexts = createQuickTexts(adopter, signature)

	return (
		<CardListSection
			items={quickTexts.map((qt) => ({
				node: (
					<QuickTextItem
						adopterFirstName={adopter.demographics.firstName}
						adopterID={adopter.demographics.ID}
						apptID={apptData.ID}
						qt={qt}
						templateFlags={booking?.flags ?? []}
						wildcardDefaults={wildcardDefaults}
					/>
				),
			}))}
			showBorder
			title={"Message " + adopter.demographics.firstName}
		/>
	)
}

function WatchlistSection({ apptData }: { apptData: IAppointment }) {
	const schedule = useScheduleState()
	const { adopter } = unpackApptData(apptData)

	if (!adopter || adopter.watchlist.length == 0) {
		return
	}

	const watchlistTable: ValueLabelPair<ReactNode>[] = []
	const { funSize, puppies, adults } = getAvailableTypes(apptData.type, schedule.dateUtil.GetWeekday())

	const notYetAvailableDogs = getNotYetAvailableDogsFromWatchlist(
		adopter.watchlist,
		schedule.dateUtil,
		funSize,
		puppies,
		adults
	)

	const noLongerAvailableDogs = adopter.watchlist
		.filter((dog) => !dog.availableNow)
		.map((dog) => dog.name)
		.sort((a, b) => a.localeCompare(b))

	const stillAvailableDogs = adopter.watchlist
		.filter(
			(dog) => !notYetAvailableDogs.some((d) => d === dog.name) && !noLongerAvailableDogs.some((d) => d === dog.name)
		)
		.map((dog) => dog.name)
		.sort((a, b) => a.localeCompare(b))

	if (stillAvailableDogs.length > 0) {
		watchlistTable.push({
			label: "Still Available",
			value: <span className="font-semibold uppercase">{stillAvailableDogs.join(", ")}</span>,
		})
	}

	if (notYetAvailableDogs.length > 0) {
		watchlistTable.push({
			label: "Not Yet Available",
			value: <span className="font-light">{notYetAvailableDogs.join(", ")}</span>,
		})
	}

	if (noLongerAvailableDogs.length > 0) {
		watchlistTable.push({
			label: "No Longer Available",
			value: (
				<span>
					<span className="line-through">{noLongerAvailableDogs.join(", ")}</span>{" "}
					<TooltipProvider tooltip={`We've auto-notified ${adopter.demographics.firstName} that these dogs were adopted.`}>
						<FontAwesomeIcon icon={faInfoCircle} />
					</TooltipProvider>
				</span>
			),
		})
	}

	return <CardTableSection items={watchlistTable} showBorder title="Watchlist" />
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
		watchlist
			?.filter((dog) => dog.availableDate && new DateTime(dog.availableDate).DiffWithDate(scheduleDateUtil) > 0)
			.map((dog) => dog.name) ?? []

	if (!funSize) {
		const funSizeDogs: string[] = watchlist?.filter((dog) => dog.funSize).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(funSizeDogs)
	}

	if (!puppies) {
		const puppyDogs: string[] = watchlist?.filter((dog) => dog.ageMonths <= 6).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(puppyDogs)
	}

	if (!adults) {
		const adultDogs: string[] = watchlist?.filter((dog) => dog.ageMonths > 6 && !dog.funSize).map((dog) => dog.name) ?? []
		notYetAvailableDogs = notYetAvailableDogs.concat(adultDogs)
	}

	return [...new Set(notYetAvailableDogs)].sort((a, b) => a.localeCompare(b))
}
