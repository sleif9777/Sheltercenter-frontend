import { faDog } from "@fortawesome/free-solid-svg-icons"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { AppointmentCard } from "../../cards/appointments/AppointmentCard"
import { AppointmentCardContext } from "../../cards/appointments/Types"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { CardItem, CardListSection } from "../../core/components/card/CardListSection"
import { CardTableSection } from "../../core/components/card/CardTableSection"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import {
	ActivityLevelLabel,
	AdopterApprovalStatus,
	AgePreference,
	AgePreferenceLabel,
	GenderPreference,
	GenderPreferenceLabel,
	HousingOwnershipLabel,
	HousingTypeLabel,
} from "../../enums/AdopterEnums"
import { EnumLabel } from "../../enums/EnumLabel"
import { UserForm } from "../../forms/users/UserForm"
import { UserFormContext } from "../../forms/users/UserFormState"
import { AdopterDemographics, AdopterPreferences, BookingHistory } from "../../models/AdopterModels"
import { AdopterWatchlist } from "../../models/DogModels"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { DogsAPI } from "../../api/dogs/DogsAPI"
import { getPetsInHomeListing, getWeightPreferenceListing } from "../../cards/appointments/Utils"
import { DateTime } from "../../utils/DateTime"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { StringUtils } from "../../utils/StringUtils"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { UpdatePrimaryEmailForm } from "../../forms/users/UpdatePrimaryEmailForm"
import { useAdopterDetailsState } from "./AdopterDetailsAppState"

export default function AdopterDetailsApp() {
	usePageTitle("Adopter Profile")
	const { id } = useParams(),
		intID = parseInt(id ?? "0")
	const context = UserFormContext.EDIT
	const appState = useAdopterDetailsState(),
		{ demo, apptID } = appState
	const userFormDefaults = useMemo(() => ({ ...demo }), [demo])

	useEffect(() => {
		if (intID) {
			appState.refresh(intID)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [intID])

	if (!id || !demo) {
		return (
			<FullWidthPage>
				<PlaceholderText iconDef={faDog} text={"Adopter not found."} />
			</FullWidthPage>
		)
	}

	return (
		id &&
		demo && (
			<FullWidthPage smallerSubtitle subtitle={getSubtitle(demo)} title={getTitle(demo)}>
				<div className="mx-5 mt-3 flex flex-row border-t-2 border-pink-700 py-2">
					<div className="w-[50%]">
						<UserForm context={context} defaults={userFormDefaults} />
					</div>
					<div className="w-[50%]">
						<div className="flex flex-1 flex-row gap-x-2 pb-2">
							{demo.status == AdopterApprovalStatus.APPROVED && !demo.approvalExpired && <ResendApprovalButton demo={demo} />}
							<UpdatePrimaryEmailButton primaryEmail={demo.primaryEmail} />
							<RestoreAccessButton demo={demo} />
						</div>
						{apptID && <AppointmentCard apptID={apptID} context={AppointmentCardContext.ADOPTER_DETAIL} />}
						<BookingHistoryCard history={demo.bookingHistory} />
						<AdopterPreferencesCard adopterID={demo.ID} firstName={demo.firstName} />
						<AdopterWatchlistCard adopterID={demo.ID} firstName={demo.firstName} />
					</div>
				</div>
			</FullWidthPage>
		)
	)
}

function getTitle(demo: AdopterDemographics) {
	return [demo.firstName, demo.lastName].join(" ")
}

function getSubtitle(demo: AdopterDemographics) {
	return [demo.primaryEmail, demo.phoneNumber, "Expires " + new DateTime(demo.approvedUntilISO).GetShortDate()]
		.filter((i) => !StringUtils.isNull(i))
		.join(" | ")
}

function ResendApprovalButton({ demo }: { demo: AdopterDemographics }) {
	const handleResendApproval = useCallback(async () => {
		try {
			await new AdoptersAPI().ResendApproval(demo.ID)
			showToast({ level: MessageLevel.Success, message: "Approval resent" })
		} catch {
			showToast({ level: MessageLevel.Error, message: "Could not resend approval" })
		}
	}, [demo.ID])

	return <ActionButton demo={demo} label="Resend Approval" onClick={handleResendApproval} />
}

function UpdatePrimaryEmailButton({ primaryEmail }: { primaryEmail: string }) {
	const modalState = useModalState()

	return (
		<>
			<button
				className="m-auto mt-2.5 block rounded-md border-2 border-gray-700 bg-gray-100 px-3 py-1 text-sm uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
				onClick={modalState.open}
			>
				Update Primary Email
			</button>
			<Modal modalState={modalState} modalTitle="Update Email">
				<UpdatePrimaryEmailForm modalState={modalState} primaryEmail={primaryEmail} />
			</Modal>
		</>
	)
}

function RestoreAccessButton({ demo }: { demo: AdopterDemographics }) {
	const handleRestoreAccess = useCallback(async () => {
		try {
			await new AdoptersAPI().RestoreCalendarAccess(demo.ID)
			showToast({ level: MessageLevel.Success, message: "Calendar access restored" })
		} catch {
			showToast({ level: MessageLevel.Error, message: "Could not restore access" })
		}
	}, [demo.ID])

	return (
		<TooltipProvider tooltip={demo.restrictedCalendar ? "" : "This adopter already has active calendar access"}>
			<ActionButton demo={demo} disabled={!demo.restrictedCalendar} label="Restore Access" onClick={handleRestoreAccess} />
		</TooltipProvider>
	)
}

function ActionButton({
	demo,
	disabled,
	label,
	onClick,
}: {
	demo: AdopterDemographics
	disabled?: boolean
	label: string
	onClick: () => void
}) {
	if (demo.approvalExpired || demo.status > AdopterApprovalStatus.APPROVED) {
		return
	}

	return (
		<button
			className="m-auto mt-2.5 block rounded-md border-2 border-gray-700 bg-gray-100 px-3 py-1 text-sm uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
			disabled={disabled}
			onClick={onClick}
		>
			{label}
		</button>
	)
}

function AdopterPreferencesCard({ adopterID, firstName }: { adopterID: number; firstName: string }) {
	const [prefs, setPrefs] = useState<AdopterPreferences | null>(null)

	useEffect(() => {
		new AdoptersAPI().GetAdopterPreferences(adopterID).then((resp) => setPrefs(resp.pref))
	}, [adopterID])

	if (!prefs) return null

	const aboutItems: CardItem<ReactNode>[] = [
		{ node: <EnumLabel appendText=" activity household" labelMap={ActivityLevelLabel} value={prefs.activityLevel} /> },
		{
			node: (
				<>
					<EnumLabel labelMap={HousingTypeLabel} value={prefs.housingType} />
					<EnumLabel appendText=")" labelMap={HousingOwnershipLabel} prependText=" (" value={prefs.housingOwnership} />
				</>
			),
		},
		{ node: "Has fence", showIf: prefs.hasFence },
		{
			node: (
				<EnumLabel
					hidden={prefs.genderPreference == GenderPreference.NO_PREFERENCE}
					labelMap={GenderPreferenceLabel}
					lowercase
					prependText="Only interested in "
					value={prefs.genderPreference}
				/>
			),
		},
		{
			node: (
				<EnumLabel
					hidden={prefs.agePreference == AgePreference.NO_PREFERENCE}
					labelMap={AgePreferenceLabel}
					lowercase
					prependText="Only interested in "
					value={prefs.agePreference}
				/>
			),
		},
		{
			node: "Pets in home: " + getPetsInHomeListing(prefs),
			showIf: prefs.hasCats || prefs.hasDogs || prefs.hasOtherPets,
		},
		{
			node: getWeightPreferenceListing(prefs),
			showIf: !!prefs.minWeightPreference || !!prefs.maxWeightPreference,
		},
		{ node: "Low shed preferred", showIf: prefs.lowShed },
		{ node: "Mobility assistance needed", showIf: prefs.mobility },
		{ node: "Bringing dog to visit", showIf: prefs.bringingDog },
	]

	const noteItems = [
		{ label: "From " + firstName, value: prefs.adopterNotes },
		{ label: "From Shelterluv", value: prefs.applicationComments },
		{ label: "From Adoptions", value: prefs.internalNotes },
	]

	const hasNotes = noteItems.some((n) => (n.value ?? "").length > 0)

	return (
		<StandardCard color={CardColor.PINK} description={"About " + firstName}>
			<CardListSection items={aboutItems} showBorder />
			<CardTableSection items={noteItems} title={hasNotes ? "Notes" : "No Notes"} />
		</StandardCard>
	)
}

function AdopterWatchlistCard({ adopterID, firstName }: { adopterID: number; firstName: string }) {
	const [watchlist, setWatchlist] = useState<AdopterWatchlist | null>(null)

	useEffect(() => {
		new DogsAPI().GetWatchlistForAdopter(adopterID).then((resp) => setWatchlist(resp.watchlist))
	}, [adopterID])

	if (!watchlist) return null

	const availableDogs = watchlist.filter((d) => d.availableNow).map((d) => d.name).sort((a, b) => a.localeCompare(b))
	const notAvailableDogs = watchlist.filter((d) => !d.availableNow).map((d) => d.name).sort((a, b) => a.localeCompare(b))

	const watchlistItems = [
		{
			label: "Available",
			value: availableDogs.length > 0 ? <span className="font-semibold uppercase">{availableDogs.join(", ")}</span> : undefined,
		},
		{
			label: "Not Available",
			value: notAvailableDogs.length > 0 ? <span className="line-through">{notAvailableDogs.join(", ")}</span> : undefined,
		},
	]

	return (
		<StandardCard color={CardColor.PINK} description="Watchlist">
			{watchlist.length === 0 ? (
				<CardTableSection title={"No dogs on " + firstName + "'s watchlist"} />
			) : (
				<CardTableSection items={watchlistItems} title={firstName + "'s Watchlist"} />
			)}
		</StandardCard>
	)
}

export function BookingHistoryCard({ history }: { history: BookingHistory }) {
	return (
		<StandardCard color={CardColor.PINK} description="Booking History">
			<CardListSection
				items={[
					{ node: `Adopted: ${history.adopted ?? 0}` },
					{ node: `Completed Appointments: ${history.completed ?? 0}` },
					{ node: `No Decisions: ${history.noDecision ?? 0}` },
					{ node: `No Shows: ${history.noShow ?? 0}` },
				]}
				showBorder={false}
			/>
		</StandardCard>
	)
}
