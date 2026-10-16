import { faCalendarCheck, faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { HttpStatusCode } from "axios"
import { useCallback, useEffect, useState } from "react"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { RescheduleAppointmentRequest } from "../../api/appointments/Requests"
import { OpenAdoptionSlot } from "../../api/appointments/Responses"
import { DateInput } from "../../core/components/formInputs/DateInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { ModalState } from "../../core/components/modal/Modal"
import { IAppointment } from "../../models/AppointmentModels"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { DateTime } from "../../utils/DateTime"
import { FormProvider } from "../FormProvider"
import { RescheduleFormFieldUpdater, useRescheduleFormState } from "./RescheduleFormState"

export function RescheduleForm({ appt, modalState }: { appt: IAppointment; modalState: ModalState }) {
	// --- form state ---
	const formState = useRescheduleFormState()
	const schedule = useScheduleState()
	const { setField, reset, ...fields } = formState

	const [date, setDate] = useState<DateTime>(new DateTime(appt.isoDate))
	const [slots, setSlots] = useState<OpenAdoptionSlot[]>()

	useEffect(() => {
		reset()
		setField("apptID", appt.ID)
		setField("newApptID", 0) // runs validation so Submit starts disabled
	}, [appt.ID, reset, setField])

	const loadSlots = useCallback(async (isoDate: string) => {
		setSlots(undefined)
		const resp = await new AppointmentsAPI().GetOpenAdoptionSlots(isoDate)
		setSlots(resp?.slots ?? [])
	}, [])

	useEffect(() => {
		setField("newApptID", 0)
		loadSlots(date.GetISODate())
	}, [date, loadSlots, setField])

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<RescheduleAppointmentRequest> = useCallback(
		async (req: RescheduleAppointmentRequest) => {
			const resp = await new AppointmentsAPI().RescheduleAppointment(req)

			if (resp?.status === HttpStatusCode.Ok) {
				showToast({ level: MessageLevel.Success, message: "Appointment rescheduled. The adopter has been emailed." })
			} else {
				showToast({
					level: MessageLevel.Error,
					message: resp?.data?.error ?? "Could not reschedule. Please try again.",
				})
			}

			schedule.refresh()
		},
		[schedule]
	)

	return (
		<FormProvider
			formState={formState}
			modalState={modalState}
			submitButtonProps={{ icon: faCalendarCheck, label: "Reschedule" }}
			onSubmit={handleSubmit}
		>
			<div className="flex flex-col gap-y-3 text-left">
				<p>
					Currently booked for <b>{new DateTime(appt.isoDate).GetShortDate(true)}</b> at <b>{appt.timeDisplay}</b>.
				</p>
				<div className="max-w-2xs">
					<DateInput
						addlProps={{
							cleanable: false,
							shouldDisableDate: (d) => d.getDay() === 0 || new DateTime(d.toISOString()).GetISODate() < new DateTime().GetISODate(),
						}}
						container={() => document.querySelector(".font-lato.relative.z-10") as HTMLElement}
						currentYearOnly={false}
						fieldLabel="New date"
						value={date}
						onChange={(v) => v && setDate(v)}
					/>
				</div>
				<SlotPicker selectedApptID={fields.newApptID} setField={setField} slots={slots} />
			</div>
		</FormProvider>
	)
}

function SlotPicker({
	selectedApptID,
	setField,
	slots,
}: {
	selectedApptID: number
	setField: RescheduleFormFieldUpdater
	slots?: OpenAdoptionSlot[]
}) {
	if (!slots) {
		return <p className="italic">Loading open timeslots...</p>
	}

	if (slots.length == 0) {
		return <p className="italic">No open adoption appointments on this date. Try another day.</p>
	}

	return (
		<div className="flex flex-col gap-y-2">
			<span className="font-semibold">Pick an open timeslot</span>
			{slots.map((slot) => (
				<div className="flex flex-row flex-wrap items-center gap-2" key={slot.key}>
					<span className="w-20 shrink-0 font-semibold">{slot.label}</span>
					{slot.appts.map((a) => (
						<button
							className={
								"cursor-pointer rounded-md border px-2 py-0.5 text-sm " +
								(selectedApptID == a.ID ? "border-pink-700 bg-pink-700 font-bold text-white" : "border-pink-700 bg-pink-100 hover:bg-pink-300")
							}
							key={a.ID}
							type="button"
							onClick={() => setField("newApptID", a.ID)}
						>
							{a.locked && <FontAwesomeIcon className="mr-1" icon={faLock} />}
							{a.typeDisplay}
						</button>
					))}
				</div>
			))}
		</div>
	)
}
