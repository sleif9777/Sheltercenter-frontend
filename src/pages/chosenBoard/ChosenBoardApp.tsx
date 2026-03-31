import {
	faCheckCircle,
	faEnvelope,
	faEraser,
	faExclamationTriangle,
	faPencil,
	faShieldDog,
	faSpinner,
	faThermometer,
	faUserDoctor,
	faVirusSlash,
	faWorm,
	IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useEffect } from "react"

import { LargeButton } from "../../core/components/buttons/LargeButton"
import { StandardCard } from "../../core/components/card/Card"
import { CardActionAreYouSure } from "../../core/components/card/CardActionAreYouSure"
import { CardActionButton } from "../../core/components/card/CardActionButton"
import { CardActionSection } from "../../core/components/card/CardActionSection"
import { CardColor } from "../../core/components/card/CardEnums"
import { CardTableSection } from "../../core/components/card/CardTableSection"
import { ValueLabelPair } from "../../core/components/formInputs/SelectInput"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import {
	CircumstanceOptions,
	CircumstanceOptionsLabel,
	PendingAdoptionStatus,
	PendingAdoptionStatusLabel,
} from "../../enums/PendingAdoptionEnums"
import { ChangeDogForm } from "../../forms/pendingAdoptions/ChangeDogForm"
import { PendingAdoptionForm } from "../../forms/pendingAdoptions/PendingAdoptionForm"
import { MessageForm, QuickText } from "../../forms/users/MessageForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { IPendingAdoption } from "../../models/PendingAdoptionModels"
import { PendingAdoptionsAPI } from "../../api/pendingAdoptions/PendingAdoptionsAPI"
import { DateTime } from "../../utils/DateTime"
import { useChosenBoardState } from "./ChosenBoardAppState"
import { CardItem } from "../../core/components/card/CardListSection"
import ReactQuill from "react-quill"

export function ChosenBoardApp() {
	const boardState = useChosenBoardState()
	const groupedAdoptions = groupPendingAdoptionsByStatus(boardState.adoptions)

	useEffect(() => {
		boardState.refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FullWidthPage title="Chosen Board">
			<div className="mx-5 my-3 border-t border-pink-700 py-2">
				<PendingAdoptionFormModal />
			</div>
			{boardState.refreshingAdoptions && (
				<div>
					<PlaceholderText iconDef={faSpinner} text="Loading adoptions..." />
				</div>
			)}
			{!boardState.refreshingAdoptions && (
				<div className="mx-3">
					{Object.values(PendingAdoptionStatus)
						.filter((v) => typeof v === "number")
						.reverse()
						.map((status, i) => {
							const adoptions = groupedAdoptions[status as PendingAdoptionStatus]

							if (!adoptions || adoptions.length === 0) {
								return null
							}

							return <AdoptionGrouper adoptions={adoptions} index={i} key={status} />
						})}
					{boardState.adoptions.length === 0 && <PlaceholderText iconDef={faShieldDog} text={"No adoptions found."} />}
				</div>
			)}
		</FullWidthPage>
	)
}

function PendingAdoptionFormModal() {
	const modalState = useModalState()

	return (
		<>
			<LargeButton label="Add Adoption" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle="Add Adoption">
				<PendingAdoptionForm modalState={modalState} />
			</Modal>
		</>
	)
}

export function groupPendingAdoptionsByStatus(
	items: IPendingAdoption[]
): Record<PendingAdoptionStatus, IPendingAdoption[]> {
	return items.reduce(
		(acc, item) => {
			const status = item.status as PendingAdoptionStatus

			if (!acc[status]) {
				acc[status] = []
			}

			acc[status].push(item)
			return acc
		},
		{} as Record<PendingAdoptionStatus, IPendingAdoption[]>
	)
}

function AdoptionGrouper({ adoptions, index, key }: { adoptions: IPendingAdoption[]; index: number; key: number }) {
	const borderColor: string = index % 2 == 0 ? "border-pink-700" : "border-blue-900"
	const textColor: string = index % 2 == 0 ? "text-pink-700" : "text-blue-900"
	const cardColor: CardColor = index % 2 == 0 ? CardColor.PINK : CardColor.BLUE

	return (
		<div className={"border-b border-blue-900 pt-2 pb-3 " + borderColor} key={key}>
			<div className={"pb-2 text-left text-2xl font-medium uppercase " + textColor}>
				{PendingAdoptionStatusLabel[adoptions[0].status as PendingAdoptionStatus]}
			</div>
			<div className="columns-2 lg:columns-3">
				{adoptions
					.sort((a, b) => a.dog.localeCompare(b.dog))
					.map((a) => (
						<AdoptionCard adoption={a} cardColor={cardColor} />
					))}
			</div>
		</div>
	)
}

function AdoptionCard({ adoption, cardColor }: { adoption: IPendingAdoption; cardColor: CardColor }) {
	const overdueForUpdate = getOverdueForUpdate(adoption)
	const twoColItems: CardItem<ReactNode>[] = [
		{
			node: (
				<span className="uppercase">
					{adoption.adopter.firstName} {adoption.adopter.lastName}
				</span>
			),
		},
	]

	const details: ValueLabelPair<ReactNode>[] = [
		{
			label: "Status",
			value:
				PendingAdoptionStatusLabel[adoption.status as PendingAdoptionStatus] +
				(adoption.status == PendingAdoptionStatus.READY_TO_ROLL
					? " (HW " + (adoption.heartwormPositive ? "Pos)" : "Neg)")
					: ""),
		},
		{ label: "Circumstance", value: CircumstanceOptionsLabel[adoption.circumstance as CircumstanceOptions] },
		{ label: "Created", value: new DateTime(adoption.created).GetFullDateTime() },
		{
			label: "Last Update",
			value: (
				<>
					{adoption.updates && adoption.updates.length > 0 && (
						<>
							<span className={overdueForUpdate ? "font-bold" : ""}>
								{overdueForUpdate && (
									<TooltipProvider tooltip="Overdue for update">
										<FontAwesomeIcon icon={faExclamationTriangle} />
									</TooltipProvider>
								)}{" "}
								{new DateTime(adoption.updates[adoption.updates.length - 1].instant).GetFullDateTime()}
							</span>
						</>
					)}
					<details>
						<summary>{`Updates Sent (${(adoption.updates ?? []).length}):`}</summary>
						{adoption.updates && adoption.updates.length > 0 && (
							<ul>
								{adoption.updates.map((update) => (
									<li>{new DateTime(update.instant).GetFullDateTime()}</li>
								))}
							</ul>
						)}
					</details>
				</>
			),
		},
	]

	return (
		<StandardCard
			actions={<AdoptionCardActions adoption={adoption} />}
			className="rounded-lg"
			color={cardColor}
			description={<AdoptionCardTitle adoption={adoption} />}
			minWidth="min-w-fit"
			twoColItems={twoColItems}
		>
			<CardTableSection items={details} />
		</StandardCard>
	)
}

function AdoptionCardTitle({ adoption }: { adoption: IPendingAdoption }) {
	return (
		<div className="flex flex-row items-start gap-x-1">
			<span>{adoption.dog}</span>
		</div>
	)
}

function ChangeDogFormModal({ adoptionID }: { adoptionID: number }) {
	const modalState = useModalState()

	return (
		<>
			<Modal modalState={modalState} modalTitle="Change Dog">
				<ChangeDogForm adoptionID={adoptionID} modalState={modalState} />
			</Modal>
			<CardActionButton primaryIcon={faPencil} primaryTooltipContent="" onClick={modalState.open} />
		</>
	)
}

function getOverdueForUpdate(adoption: IPendingAdoption) {
	const compareInst = new DateTime(
		adoption.updates && adoption.updates?.length > 0
			? adoption.updates[adoption.updates.length - 1].instant
			: adoption.created
	)

	return new DateTime().DiffWithDate(compareInst) >= 7
}

interface AdoptionCardActionProps {
	adoption: IPendingAdoption
	heartworm?: boolean
	icon: IconDefinition
	message?: string
	titleAndTooltip: string
	status: PendingAdoptionStatus
}

interface AdoptionCardAreYouSureActionProps extends AdoptionCardActionProps {
	youWantTo: string
}

export function AdoptionCardActions({ adoption }: { adoption: IPendingAdoption }) {
	const actionProps = {
		adoption: adoption,
	}

	return (
		<CardActionSection color={CardColor.PINK}>
			<MessageButton adoption={adoption} />
			<ChangeDogFormModal adoptionID={adoption.ID} />
			<StatusButton
				{...actionProps}
				icon={faUserDoctor}
				status={PendingAdoptionStatus.NEEDS_VETTING}
				titleAndTooltip="Needs Vetting"
			/>
			<StatusButton
				{...actionProps}
				icon={faThermometer}
				status={PendingAdoptionStatus.NEEDS_WELL_CHECK}
				titleAndTooltip="Needs Well Check"
			/>
			<StatusButton
				{...actionProps}
				heartworm
				icon={faWorm}
				status={PendingAdoptionStatus.READY_TO_ROLL}
				titleAndTooltip="Ready to Roll - HW Pos"
			/>
			<StatusButton
				{...actionProps}
				icon={faVirusSlash}
				status={PendingAdoptionStatus.READY_TO_ROLL}
				titleAndTooltip="Ready to Roll - HW Neg"
			/>
			<StatusButton
				{...actionProps}
				icon={faCheckCircle}
				status={PendingAdoptionStatus.COMPLETED}
				titleAndTooltip="Completed"
			/>
			<StatusAreYouSureButton
				{...actionProps}
				icon={faEraser}
				status={PendingAdoptionStatus.CANCELED}
				titleAndTooltip="Cancel Adoption"
				youWantTo="cancel this adoption"
			/>
		</CardActionSection>
	)
}

function MessageButton({ adoption }: { adoption: IPendingAdoption }) {
	const modalState = useModalState()

	const quickTexts: QuickText[] = [
		{
			label: "Cough",
			templateContent: getQuickTextContent(adoption, "a cough"),
			value: 0,
		},
		{
			label: "Nasal Discharge",
			templateContent: getQuickTextContent(adoption, "some nasal discharge"),
			value: 1,
		},
	]

	return (
		<>
			<CardActionButton
				primaryIcon={faEnvelope}
				primaryTooltipContent={"Message " + adoption.adopter.firstName}
				onClick={modalState.open}
			/>
			<Modal modalState={modalState} modalTitle={"Message " + adoption.adopter.firstName}>
				<MessageForm
					adopterID={adoption.adopter.ID ?? 0}
					hideSubject
					modalState={modalState}
					quickTextOptions={quickTexts}
				/>
			</Modal>
		</>
	)
}

function getQuickTextContent(adoption: IPendingAdoption, condition: string) {
	return {
		ops: [
			// Greeting in pink
			{ attributes: { color: "#a7396e" }, insert: `Hi ${adoption.adopter.firstName},` },
			{ insert: "\n\n" },

			// Main body
			{ insert: `Just a quick update on ` },
			{ attributes: { bold: true }, insert: adoption.dog },
			{ insert: "!\n\n" },

			{
				insert:
					"They had a vet visit today and, unfortunately, they've got " +
					condition +
					" — a common sign of an upper respiratory infection. Not the best news, but the good news is we've got them on new meds, and they'll be seeing the vet again next week for a follow-up.",
			},

			// Sign-off in teal
			{ attributes: { color: "#1e6c80" }, insert: "Kind regards," },
			{ insert: "\n" },

			// Signature in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: "The Adoptions Team" },
			{ insert: "\n" },

			// Organization name in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: "Saving Grace Animals for Adoption" },
		],
	} as ReactQuill.Value
}

function StatusButton({ adoption, heartworm, icon, status, titleAndTooltip }: AdoptionCardActionProps) {
	const adoptionID = adoption.ID
	const boardState = useChosenBoardState()

	const handleClick = useCallback(async () => {
		if (!adoptionID) {
			return
		}

		await new PendingAdoptionsAPI().MarkStatus(adoptionID, status, heartworm)
		boardState.refresh()
	}, [adoptionID, boardState, heartworm, status])

	return <CardActionButton primaryIcon={icon} primaryTooltipContent={titleAndTooltip} onClick={handleClick} />
}

function StatusAreYouSureButton({
	adoption,
	heartworm,
	icon,
	titleAndTooltip: modalTitle,
	status,
	youWantTo,
}: AdoptionCardAreYouSureActionProps) {
	const adoptionID = adoption.ID
	const boardState = useChosenBoardState()

	const handleDelete = useCallback(async () => {
		if (!adoptionID) {
			return
		}

		await new PendingAdoptionsAPI().MarkStatus(adoptionID, status, heartworm)
		boardState.refresh()
	}, [adoptionID, boardState, heartworm, status])

	return <CardActionAreYouSure icon={icon} modalTitle={modalTitle} youWantTo={youWantTo} onSubmit={handleDelete} />
}
