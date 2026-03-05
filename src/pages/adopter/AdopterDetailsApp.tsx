import { faDog } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { AppointmentCard } from "../../cards/appointments/AppointmentCard"
import { AppointmentCardContext } from "../../cards/appointments/Types"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { CardListSection } from "../../core/components/card/CardListSection"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { AdopterApprovalStatus } from "../../enums/AdopterEnums"
import { UserForm } from "../../forms/users/UserForm"
import { UserFormContext } from "../../forms/users/UserFormState"
import { AdopterDemographics, BookingHistory } from "../../models/AdopterModels"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { DateTime } from "../../utils/DateTime"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { StringUtils } from "../../utils/StringUtils"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { UpdatePrimaryEmailForm } from "../../forms/users/UpdatePrimaryEmailForm"
import { useAdopterDetailsState } from "./AdopterDetailsAppState"

export default function AdopterDetailsApp() {
	const { id } = useParams(),
		intID = parseInt(id ?? "0")
	const context = UserFormContext.EDIT
	const appState = useAdopterDetailsState(),
		{ demo, apptID } = appState

	const fetchData = useCallback(
		async (intID: number) => {
			if (!intID) {
				return
			}

			appState.refresh(intID)
		},
		[appState]
	)

	useEffect(() => {
		fetchData(intID)
	}, [fetchData, intID])

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
						<UserForm
							context={context}
							defaults={{
								...demo,
							}}
						/>
					</div>
					<div className="w-[50%]">
						<div className="flex flex-1 flex-row gap-x-2 pb-2">
							{demo.status == AdopterApprovalStatus.APPROVED && !demo.approvalExpired && <ResendApprovalButton demo={demo} />}
							<UpdatePrimaryEmailButton primaryEmail={demo.primaryEmail} />
							<RestoreAccessButton demo={demo} />
						</div>
						{apptID && <AppointmentCard apptID={apptID} context={AppointmentCardContext.ADOPTER_DETAIL} />}
						<BookingHistoryCard history={demo.bookingHistory} />
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
			await new AdoptersAPI().ResendApproval(demo.ID)
			showToast({ level: MessageLevel.Success, message: "Calendar access restored" })
		} catch {
			showToast({ level: MessageLevel.Error, message: "Could not restore access" })
		}
	}, [demo.ID])

	return (
		<TooltipProvider tooltip={demo.restrictedCalendar ? "" : "This adopter already has active calendar access"}>
			<ActionButton demo={demo} disabled={true} label="Restore Access" onClick={handleRestoreAccess} />
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
