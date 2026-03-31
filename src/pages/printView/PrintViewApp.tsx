import { faCat, faDog, faVirusSlash, faWheelchair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { getAdopterVisitCount } from "../../cards/appointments/Utils"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { ReportRowComponentProps, useReportingAppointment } from "../../core/components/report/UseReportingHook"
import { AppointmentType } from "../../enums/AppointmentEnums"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { HashAppointment, ReportingAdminAppointment, ReportingAdoptionAppointment, ReportingAppointment } from "../../models/AppointmentModels"
import { IBooking } from "../../models/BookingModels"
import { DateTime } from "../../utils/DateTime"
import { ScheduleAppTitle } from "../schedule/ScheduleApp"
import { useScheduleState } from "../schedule/ScheduleAppState"

export default function PrintViewApp() {
	const { date } = useParams()
	const schedule = useScheduleState()

	useEffect(() => {
		schedule.refresh(date)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const displayAppts = (schedule.apptHash ?? [])
		.flatMap((t) => t.value)
		.filter((a) => a.hasCurrentBooking || a.isAdminAppt)

	return (
		<FullWidthPage title={<ScheduleAppTitle />}>
			<div className="mx-2 mt-3 border-t border-pink-700 pt-3">
				<table className="w-full text-left">
					<thead className="text-lg underline">
						<tr>
							<th>Time</th>
							<th>Appointment</th>
							<th className="hidden lg:table-cell print:table-cell">Notes</th>
							<th className="hidden lg:table-cell print:table-cell">Check-In</th>
							<th className="hidden lg:table-cell print:table-cell">Clothing Description</th>
							<th className="hidden lg:table-cell print:table-cell">Counselor</th>
							<th>Check-Out</th>
						</tr>
					</thead>
					<tbody>
						{displayAppts.map((a, i) => (
							<PrintViewRow appt={a} isLast={i == displayAppts.length - 1} key={i} />
						))}
					</tbody>
				</table>
			</div>
		</FullWidthPage>
	)
}

export function PrintViewRow({ appt, isLast }: { appt: HashAppointment; isLast?: boolean }) {
	if (appt.isAdminAppt) {
		return <PrintViewAdminRow ID={appt.ID} isLast={isLast} />
	} else if (appt.hasCurrentBooking) {
		return <PrintViewAppointmentRow ID={appt.ID} isLast={isLast} />
	}
	return null
}

function PrintViewAppointmentRow({ ID: apptID, isLast }: ReportRowComponentProps) {
	const { appt } = useReportingAppointment<ReportingAdoptionAppointment>(apptID)

	if (!appt) {
		return null
	}

	return (
		<tr className={"align-top hover:bg-pink-200 " + (isLast ? "" : "border-b border-pink-700")}>
			<ApptInstantCell appt={appt} />
			<AdopterInfoCell appt={appt} />
			<AdoptionNotesCell booking={appt.booking} className="hidden lg:table-cell print:table-cell" />
			<td className="hidden lg:table-cell print:table-cell">{appt.checkInTime}</td>
			<td className="hidden lg:table-cell print:table-cell">{appt.clothingDescription}</td>
			<td className="hidden lg:table-cell print:table-cell">{appt.counselor}</td>
			<td>{appt.checkOutTime ?? ""}</td>
		</tr>
	)
}

function PrintViewAdminRow({ ID: apptID, isLast }: ReportRowComponentProps) {
	const { appt } = useReportingAppointment<ReportingAdminAppointment>(apptID)

	if (!appt) {
		return null
	}

	return (
		<tr className={"align-top hover:bg-pink-200 " + (isLast ? "" : "border-b border-pink-700")}>
			<ApptInstantCell appt={appt} />
			<AdminApptInfoCell appt={appt} />
			<AdminNotesCell appt={appt} />
			<td className="hidden lg:table-cell print:table-cell"></td>
			<td className="hidden lg:table-cell print:table-cell"></td>
			<td className="hidden lg:table-cell print:table-cell"></td>
			<td></td>
		</tr>
	)
}

// NOTE: also used in DailyReportApp
export function ApptInstantCell({ appt }: { appt: ReportingAppointment }) {
	return <td>{appt.timeDisplay}</td>
}

function AdminApptInfoCell({ appt }: { appt: ReportingAdminAppointment }) {
	return (
		<td>
			<b>{appt.description}</b>
			<div className="text-xs italic">({appt.typeDisplay})</div>
		</td>
	)
}

function AdopterInfoCell({ appt }: { appt: ReportingAdoptionAppointment }) {
	const booking = appt.booking,
		adopter = booking.adopter

	return (
		<td>
			<div>
				<b>
					{appt.description}
					{adopter.demographics.bookingHistory.completed > 1 && ` (${getAdopterVisitCount(adopter)})`}
					{adopter.preferences.mobility && (
						<TooltipProvider tooltip="Mobility Assistance Needed">
							<FontAwesomeIcon className="ml-1.25" icon={faWheelchair} />
						</TooltipProvider>
					)}
					{adopter.preferences.bringingDog && (
						<TooltipProvider tooltip="Bringing Dog">
							<FontAwesomeIcon className="ml-1.25" icon={faDog} />
						</TooltipProvider>
					)}
					{adopter.preferences.hasCats && (
						<TooltipProvider tooltip="Has Cats">
							<FontAwesomeIcon className="ml-1.25" icon={faCat} />
						</TooltipProvider>
					)}
					{adopter.preferences.lowShed && (
						<TooltipProvider tooltip="Prefers Low-Allergy">
							<FontAwesomeIcon className="ml-1.25" icon={faVirusSlash} />
						</TooltipProvider>
					)}
				</b>
			</div>
			<div className="flex flex-col gap-y-0.5 text-xs italic">
				<div>({appt.typeDisplay})</div>
				<div>Booked {new DateTime(booking.bookedInstant).GetFullDateTime()}</div>
				<div>{adopter.demographics.primaryEmail}</div>
				{adopter.demographics.phoneNumber && <div>{adopter.demographics.phoneNumber}</div>}
			</div>
		</td>
	)
}

function AdoptionNotesCell({ booking, className }: { booking: IBooking; className?: string }) {
	const adopter = booking.adopter,
		history = adopter.demographics.bookingHistory

	const notesDict = [
		{
			note: history.completed + history.noShow == 0 ? adopter.preferences.applicationComments : "",
			source: "Shelterluv",
		},
		{
			note: adopter.preferences.adopterNotes,
			source: adopter.demographics.firstName,
		},
		{
			note: adopter.demographics.internalNotes,
			source: "Adoptions",
		},
	]

	return (
		<td className={"max-w-32 " + className}>
			{notesDict.map((n, i) => (
				<Note key={i} note={n.note} source={n.source} />
			))}
		</td>
	)
}

function AdminNotesCell({ appt }: { appt: ReportingAdminAppointment }) {
	return appt.type == AppointmentType.DONATION_DROP_OFF ? (
		<td className="hidden lg:table-cell print:table-cell">
			<Note note={appt.notes} source="Appointment" />
		</td>
	) : (
		<td className="hidden lg:table-cell print:table-cell"></td>
	)
}

function Note({ source, note }: { source: string; note?: string }) {
	if (!note) {
		return null
	}

	return (
		<div>
			<b>From {source}: </b>
			{note}
		</div>
	)
}
