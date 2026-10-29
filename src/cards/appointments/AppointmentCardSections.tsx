import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useEffect, useState } from "react"
import { useStore } from "zustand"

import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { CardItem, CardListSection } from "../../core/components/card/CardListSection"
import { CardTableSection } from "../../core/components/card/CardTableSection"
import { ValueLabelPair } from "../../core/components/formInputs/SelectInput"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { AppointmentType } from "../../enums/AppointmentEnums"
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
import { BookingMessageTemplate } from "../../enums/BookingEnums"
import { EnumLabel } from "../../enums/EnumLabel"
import { MessageForm, QuickText, WildcardDefaults } from "../../forms/users/MessageForm"
import { AdopterDemographics, AdopterPreferences } from "../../models/AdopterModels"
import { IAppointment } from "../../models/AppointmentModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { StringUtils } from "../../utils/StringUtils"
import { getAvailableTypes, getNotYetAvailableDogsFromWatchlist } from "./AppointmentCardAvailability"
import { createQuickTexts } from "./MessageTemplates"
import { getPetsInHomeListing, getWeightPreferenceListing, unpackApptData } from "./Utils"

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
	const session = useSessionState()

	const hoverStyle = session.greeterUser ? "" : "cursor-pointer hover:bg-gray-300"

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
					className={"disabled:cursor-auto disabled:bg-transparent disabled:text-gray-500 disabled:line-through " + hoverStyle}
					disabled={alreadySent}
					onClick={session.greeterUser ? undefined : modalState.open}
				>
					{qt.label}
				</button>
			</TooltipProvider>
		</>
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
			{!session.adopterUser && <ContactInfoSection demographics={adopter.demographics} />}
			{!session.adopterUser && <NotesSection apptData={apptData} />}
			<WatchlistSection apptData={apptData} />
			{!session.adopterUser && <MessageSection apptData={apptData} />}
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

	if (adopter.demographics.bookingHistory.completed < 2 && !session.adopterUser) {
		allNotes.push({
			label: "From Shelterluv",
			value: adopter.preferences.applicationComments,
		})
	}

	if (!session.adopterUser) {
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
			node: <EnumLabel appendText=" activity household" labelMap={ActivityLevelLabel} value={adopter.preferences.activityLevel} />,
		},
		{
			node: `From ${adopter.demographics.city}, ${adopter.demographics.state}`,
			showIf: Boolean(adopter.demographics.city && adopter.demographics.state),
		},
		{
			node: (
				<>
					<EnumLabel labelMap={HousingTypeLabel} value={adopter.preferences.housingType} />
					<EnumLabel appendText=")" labelMap={HousingOwnershipLabel} prependText=" (" value={adopter.preferences.housingOwnership} />
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

	if (!adopter || apptData.outcome) {
		return
	}

	const { funSize, puppies, adults } = getAvailableTypes(apptData.type, schedule.dateUtil.GetWeekday())
	const notYetAvailableDogs = getNotYetAvailableDogsFromWatchlist(adopter.watchlist, schedule.dateUtil, funSize, puppies, adults)
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

	const notYetAvailableDogs = getNotYetAvailableDogsFromWatchlist(adopter.watchlist, schedule.dateUtil, funSize, puppies, adults)

	const noLongerAvailableDogs = adopter.watchlist
		.filter((dog) => !dog.availableNow)
		.map((dog) => dog.name)
		.sort((a, b) => a.localeCompare(b))

	const stillAvailableDogs = adopter.watchlist
		.filter((dog) => !notYetAvailableDogs.some((d) => d === dog.name) && !noLongerAvailableDogs.some((d) => d === dog.name))
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

// On the adopter's own card, points them to whatever they haven't filled in yet, which would otherwise
// leave the card nearly empty. Adopters' card data never includes the booking, so this looks up their
// own preferences and watchlist, and shows nothing if either lookup fails.
export function AdopterSetupSection() {
	const adopterID = useSessionState().user?.adopterID
	const [missing, setMissing] = useState<{ preferences: boolean; watchlist: boolean } | null>(null)

	useEffect(() => {
		if (!adopterID) return
		Promise.all([new AdoptersAPI().GetAdopterPreferences(adopterID), new DogsAPI().GetWatchlistForAdopter(adopterID)])
			.then(([prefsResp, watchlistResp]) =>
				setMissing({
					preferences: !!prefsResp?.pref && !hasPreferences(prefsResp.pref),
					watchlist: Array.isArray(watchlistResp?.watchlist) && watchlistResp.watchlist.length === 0,
				})
			)
			.catch(() => setMissing(null))
	}, [adopterID])

	if (!missing || (!missing.preferences && !missing.watchlist)) {
		return
	}

	return (
		<div className="flex flex-row flex-wrap justify-center gap-x-6 gap-y-1 border-b py-2 text-lg last:border-b-0">
			{missing.preferences && <SetupLink href="/preferences/" label="Add My Preferences" />}
			{missing.watchlist && <SetupLink href="/watchlist/" label="Add My Watchlist" />}
		</div>
	)
}

// Whether anything the About section shows has been filled in
export function hasPreferences(prefs: Partial<AdopterPreferences>) {
	return (
		prefs.activityLevel != null ||
		prefs.housingType != null ||
		prefs.housingOwnership != null ||
		!!prefs.hasFence ||
		!!prefs.hasCats ||
		!!prefs.hasDogs ||
		!!prefs.hasOtherPets ||
		!!prefs.minWeightPreference ||
		!!prefs.maxWeightPreference ||
		(prefs.genderPreference != null && prefs.genderPreference != GenderPreference.NO_PREFERENCE) ||
		(prefs.agePreference != null && prefs.agePreference != AgePreference.NO_PREFERENCE)
	)
}

function SetupLink({ href, label }: { href: string; label: string }) {
	return (
		<a className="font-semibold text-pink-700 underline hover:text-pink-900" href={href}>
			{label}
		</a>
	)
}

export function SurrenderInfoSection({ apptData }: { apptData: IAppointment }) {
	if (apptData.type !== AppointmentType.SURRENDER || !apptData.notes) {
		return
	}

	return <CardTableSection items={[{ label: "Notes", value: apptData.notes }]} showBorder />
}

export function VisitInfoSection({ apptData }: { apptData: IAppointment }) {
	// Older visits only recorded the dog, so there may be no adopter to show
	if (apptData.type !== AppointmentType.VISIT || !apptData.visitAdopter) {
		return
	}

	return <CardTableSection items={[{ label: "Adopter", value: apptData.visitAdopter }]} showBorder />
}
