import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { HttpStatusCode } from "axios"

import { DashboardNotesAPI } from "../../api/dashboardNotes/DashboardNotesAPI"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import { CardActionAreYouSure } from "../../core/components/card/CardActionAreYouSure"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { DashboardNoteForm } from "../../forms/dashboardNotes/DashboardNoteForm"
import { IDashboardNote } from "../../models/DashboardNoteModels"
import { DateTime } from "../../utils/DateTime"
import { DashboardCard } from "./DashboardCard"
import { useDashboardsState } from "./DashboardsAppState"

// Literal hex for older Silk builds; see the card colors in DashboardsApp.
const NOTE_CARD_COLOR = "border-[#a16207] bg-[#fef08a]" // yellow-700 / yellow-200

export function DashboardNotesSection({ canEdit, notes }: { canEdit: boolean; notes: IDashboardNote[] }) {
	const sortedNotes = [...notes].sort((a, b) => a.dogName.localeCompare(b.dogName))

	return (
		<div className="mx-3 flex flex-col gap-2">
			{canEdit && <AddNoteButton />}
			{sortedNotes.length === 0 && (
				<p className="text-center text-[#6b7280]">No notes. The Notes tab only shows on the dashboard while there is at least one.</p>
			)}
			{sortedNotes.length > 0 && (
				<ul className="tv:[zoom:1.5] columns-3">
					{sortedNotes.map((note) => (
						<DashboardNoteCard canEdit={canEdit} key={note.ID} note={note} />
					))}
				</ul>
			)}
		</div>
	)
}

function DashboardNoteCard({ canEdit, note }: { canEdit: boolean; note: IDashboardNote }) {
	return (
		<DashboardCard className={NOTE_CARD_COLOR} photoURL={note.photoURL}>
			<div className="flex min-w-0 flex-col">
				<span className="text-lg font-medium uppercase">{note.dogName}</span>
				<span className="wrap-break-word">{note.note}</span>
				{/* Editors only, so the TV just shows the note */}
				{canEdit && note.showUntil && (
					<span className="text-sm text-[#6b7280]">Shows through {DateTime.FromISODate(note.showUntil).GetShortDate(true)}</span>
				)}
			</div>
			{canEdit && (
				<div className="ml-auto shrink-0">
					<RemoveNoteButton note={note} />
				</div>
			)}
		</DashboardCard>
	)
}

function AddNoteButton() {
	const modalState = useModalState()

	return (
		<>
			<LargeButton label="Add Note" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle="Add Note">
				<DashboardNoteForm modalState={modalState} />
			</Modal>
		</>
	)
}

function RemoveNoteButton({ note }: { note: IDashboardNote }) {
	async function handleRemove() {
		// buildAndPost resolves with the error rather than rejecting, so check the status
		const resp = await new DashboardNotesAPI().DeleteDashboardNote(note.ID)
		if (resp?.status !== HttpStatusCode.Ok) {
			showToast({ level: MessageLevel.Error, message: `Could not remove the note for ${note.dogName}. Please try again.` })
		}
		useDashboardsState.getState().refresh()
	}

	return (
		<CardActionAreYouSure icon={faTrash} modalTitle="Remove note" youWantTo={`remove "${note.note}" for ${note.dogName}`} onSubmit={handleRemove} />
	)
}
