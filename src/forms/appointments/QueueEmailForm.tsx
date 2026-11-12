import { faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faEnvelopeCircleCheck, faGripVertical, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { HttpStatusCode } from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { SendQueueEmailsResponse } from "../../api/appointments/Responses"
import { SubmissionButton } from "../../core/components/formInputs/SubmissionButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { ModalState } from "../../core/components/modal/Modal"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { PopularDogsPicker, QueueMessageEditor, useQueueMessage } from "./QueueEmailCustomization"
import {
	getEmailEntries,
	getIncludedDogIDs,
	getQueuePositions,
	hasQueueNumber,
	moveRow,
	QueueDogRow,
	QueueEditorRow,
	toDogRows,
	toEmailMessage,
	toEditorRows,
} from "./QueueEmailUtils"

export function QueueEmailForm({ modalState }: { modalState: ModalState }) {
	const schedule = useScheduleState()
	const [rows, setRows] = useState<QueueEditorRow[]>()
	const [dragIndex, setDragIndex] = useState<number | null>(null)
	const [isSending, setIsSending] = useState(false)
	// Queue order, then the message
	const [step, setStep] = useState<1 | 2>(1)

	const [dogs, setDogs] = useState<QueueDogRow[]>([])
	const hasDogs = dogs.some((d) => d.included)
	const { hasDefault, isDefault, loadDefault, message, reset, setMessage, showDogsSection } = useQueueMessage(hasDogs)

	// The popular dogs section comes and goes with the first checked dog
	const updateDogs = useCallback(
		(update: (prev: QueueDogRow[]) => QueueDogRow[]) => {
			const next = update(dogs)
			setDogs(next)
			showDogsSection(next.some((d) => d.included))
		},
		[dogs, showDogsSection]
	)

	useEffect(() => {
		new AppointmentsAPI().GetQueueForDate(schedule.isoDate).then((resp) => {
			setRows(toEditorRows(resp?.queue ?? []))
			if (resp?.defaultMessage != null) {
				loadDefault(resp.defaultMessage)
			}
			setDogs(toDogRows(resp?.popularDogs ?? []))
		})
	}, [loadDefault, schedule.isoDate])

	const positions = useMemo(() => getQueuePositions(rows ?? []), [rows])
	const entries = useMemo(() => getEmailEntries(rows ?? []), [rows])
	// The message step appears once the default message has loaded
	const customizing = hasDefault
	const messageInvalid = customizing && !hasQueueNumber(message)
	const onQueueStep = !customizing || step == 1

	const updateRow = useCallback((apptID: number, patch: Partial<QueueEditorRow>) => {
		setRows((prev) => prev?.map((r) => (r.apptID === apptID ? { ...r, ...patch } : r)))
	}, [])

	const move = useCallback((from: number, to: number) => {
		setRows((prev) => (prev ? moveRow(prev, from, to) : prev))
	}, [])

	const handleSend = useCallback(async () => {
		if (entries.length == 0 || isSending || messageInvalid) {
			return
		}

		setIsSending(true)
		try {
			const resp = await new AppointmentsAPI().SendQueueEmails(
				customizing ? { dogIDs: getIncludedDogIDs(dogs), entries, message: toEmailMessage(message) } : { entries }
			)
			const result = resp?.data as SendQueueEmailsResponse | undefined

			if (resp?.status !== HttpStatusCode.Ok || !result) {
				showToast({ level: MessageLevel.Error, message: "Failed to send queue emails. Please try again." })
				return
			}

			if (result.failed.length > 0) {
				showToast({
					level: MessageLevel.Warning,
					message: `Sent ${result.sent}. Could not email: ${result.failed.join(", ")}`,
				})
			} else {
				showToast({ level: MessageLevel.Success, message: `Sent ${result.sent} queue email${result.sent == 1 ? "" : "s"}.` })
			}

			schedule.refresh()
			modalState.close()
		} finally {
			setIsSending(false)
		}
	}, [customizing, dogs, entries, isSending, message, messageInvalid, modalState, schedule])

	return (
		<div className="flex min-h-0 w-full flex-1 flex-col text-left text-black">
			{customizing && (
				<p className="mb-2 text-sm font-semibold text-pink-800 uppercase">
					Step {step} of 2 · {step == 1 ? "Queue order" : "Message"}
				</p>
			)}
			{onQueueStep && <p className="mb-2">Drag to reorder, uncheck to remove someone from the queue. Adopters already emailed start unchecked.</p>}
			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				{onQueueStep ? (
					<>
						<QueueList dragIndex={dragIndex} move={move} positions={positions} rows={rows} setDragIndex={setDragIndex} updateRow={updateRow} />
					</>
				) : (
					// Fields left, message right, matching the message form
					<div className="flex flex-col gap-3 md:flex-row">
						<div className="w-full md:w-1/2">
							<PopularDogsPicker dogs={dogs} setDogs={updateDogs} />
						</div>
						<div className="w-full md:w-1/2">
							<QueueMessageEditor
								isDefault={isDefault}
								message={message}
								popularDogNames={dogs.filter((d) => d.included).map((d) => d.name)}
								setMessage={setMessage}
								onReset={reset}
							/>
						</div>
					</div>
				)}
			</div>
			<div className="mt-3 flex shrink-0 flex-row items-center justify-end gap-x-3 border-t border-pink-800 py-3">
				<span className="mr-auto text-sm italic">
					{entries.length} adopter{entries.length == 1 ? "" : "s"} will be emailed
				</span>
				<SubmissionButton addlProps={{ type: "button" }} icon={faXmark} label="Cancel" onClick={modalState.close} />
				{customizing && step == 2 && <SubmissionButton addlProps={{ type: "button" }} icon={faArrowLeft} label="Back" onClick={() => setStep(1)} />}
				{customizing && step == 1 ? (
					<SubmissionButton addlProps={{ type: "button" }} disabled={entries.length == 0} icon={faArrowRight} label="Next" onClick={() => setStep(2)} />
				) : (
					<SubmissionButton
						addlProps={{ type: "button" }}
						disabled={entries.length == 0 || isSending || messageInvalid}
						icon={faEnvelopeCircleCheck}
						label={isSending ? "Sending..." : "Send"}
						onClick={handleSend}
					/>
				)}
			</div>
		</div>
	)
}

function QueueList({
	dragIndex,
	move,
	positions,
	rows,
	setDragIndex,
	updateRow,
}: {
	dragIndex: number | null
	move: (from: number, to: number) => void
	positions: Map<number, number>
	rows?: QueueEditorRow[]
	setDragIndex: (i: number | null) => void
	updateRow: (apptID: number, patch: Partial<QueueEditorRow>) => void
}) {
	if (!rows) {
		return <p className="italic">Loading queue...</p>
	}

	if (rows.length == 0) {
		return <p className="italic">No booked adoption appointments through 4:00 PM on this date.</p>
	}

	return (
		<ol className="flex flex-col gap-y-1">
			{rows.map((r, i) => {
				const position = positions.get(r.apptID)

				return (
					<li
						className={
							"flex flex-row items-center gap-x-3 rounded-md border px-2 py-1 " +
							(r.included ? "border-pink-700 bg-white" : "border-gray-400 bg-gray-100 text-gray-500") +
							(dragIndex === i ? " opacity-50" : "")
						}
						draggable
						key={r.apptID}
						onDragEnd={() => setDragIndex(null)}
						onDragOver={(e) => {
							e.preventDefault()
							if (dragIndex !== null && dragIndex !== i) {
								move(dragIndex, i)
								setDragIndex(i)
							}
						}}
						onDragStart={(e) => {
							e.dataTransfer.effectAllowed = "move"
							setDragIndex(i)
						}}
					>
						<FontAwesomeIcon className="cursor-grab text-gray-500" icon={faGripVertical} />
						<input
							aria-label={`Include ${r.adopterName} in the queue`}
							checked={r.included}
							className="h-4 w-4 cursor-pointer accent-pink-700"
							type="checkbox"
							onChange={(e) => updateRow(r.apptID, { included: e.target.checked })}
						/>
						<span className="w-8 text-right text-lg font-bold">{position ? `#${position}` : "—"}</span>
						<div className="flex flex-1 flex-col">
							<span className={"font-semibold" + (r.included ? "" : " line-through")}>{r.adopterName}</span>
							<span className="text-xs">
								{r.timeDisplay} · {r.typeDisplay} · booked {r.bookedDisplay}
							</span>
						</div>
						{r.alreadySent && <span className="rounded-sm bg-green-200 px-1 text-xs font-semibold text-green-800 uppercase">Sent</span>}
						<div className="flex flex-col">
							<button
								aria-label="Move up"
								className="cursor-pointer px-1 hover:text-pink-700 disabled:cursor-default disabled:text-gray-300"
								disabled={i == 0}
								type="button"
								onClick={() => move(i, i - 1)}
							>
								<FontAwesomeIcon icon={faArrowUp} size="xs" />
							</button>
							<button
								aria-label="Move down"
								className="cursor-pointer px-1 hover:text-pink-700 disabled:cursor-default disabled:text-gray-300"
								disabled={i == rows.length - 1}
								type="button"
								onClick={() => move(i, i + 1)}
							>
								<FontAwesomeIcon icon={faArrowDown} size="xs" />
							</button>
						</div>
					</li>
				)
			})}
		</ol>
	)
}
