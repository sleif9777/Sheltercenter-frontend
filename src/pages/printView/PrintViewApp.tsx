import { faCat, faDog, faVirusSlash, faWheelchair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { getAdopterVisitCount } from "../../cards/appointments/Utils"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { ReportRowComponentProps, useReportingAppointment } from "../../core/components/report/UseReportingHook"
import { AppointmentType } from "../../enums/AppointmentEnums"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import {
	HashAppointment,
	ReportingAdminAppointment,
	ReportingAdoptionAppointment,
	ReportingAppointment,
} from "../../models/AppointmentModels"
import { IBooking } from "../../models/BookingModels"
import { DateTime } from "../../utils/DateTime"
import { ScheduleAppTitle } from "../schedule/ScheduleApp"
import { useScheduleState } from "../schedule/ScheduleAppState"
import { AdopterWatchlist } from "../../models/DogModels"
import { getAvailableTypes, getNotYetAvailableDogsFromWatchlist } from "../../cards/appointments/AppointmentCard"

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
			<div className="mx-2 mt-3 pt-3 not-print:border-t not-print:border-pink-700">
				<table className="w-full text-left print:text-xs print:leading-tight">
					<thead className="text-lg underline print:text-xs">
						<tr className="print:border-b print:border-pink-700">
							<th className="print:pl-0.5">Time</th>
							<th className="print:pl-0.5">Appointment</th>
							<th className="hidden lg:table-cell print:table-cell print:pl-0.5">Notes</th>
							<th className="hidden lg:table-cell print:table-cell print:pl-0.5">Watchlist</th>
							<th className="hidden lg:table-cell print:table-cell print:pl-0.5">Check-In</th>
							<th className="hidden lg:table-cell print:table-cell print:pl-0.5">Clothing Description</th>
							<th className="hidden lg:table-cell print:table-cell print:pl-0.5">Counselor</th>
							<th className="print:pl-0.5">Check-Out</th>
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
			<AdoptionNotesCell
				booking={appt.booking}
				className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"
			/>
			<WatchlistCell
				appointment={appt}
				className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"
			/>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5">
				{appt.checkInTime}
			</td>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5">
				{appt.clothingDescription}
			</td>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5">
				{appt.counselor}
			</td>
			<td className="print:border-l print:border-pink-700 print:p-0.5">{appt.checkOutTime ?? ""}</td>
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
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"></td>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"></td>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"></td>
			<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5"></td>
			<td className="print:border-l print:border-pink-700 print:p-0.5"></td>
		</tr>
	)
}

// NOTE: also used in DailyReportApp
export function ApptInstantCell({ appt }: { appt: ReportingAppointment }) {
	return <td className="print:border-r print:border-pink-700 print:p-0.5">{appt.timeDisplay}</td>
}

function AdminApptInfoCell({ appt }: { appt: ReportingAdminAppointment }) {
	return (
		<td className="print:border-x print:border-pink-700 print:p-0.5">
			<b>{appt.description}</b>
			<div className="text-xs italic">({appt.typeDisplay})</div>
		</td>
	)
}

function AdopterInfoCell({ appt }: { appt: ReportingAdoptionAppointment }) {
	const booking = appt.booking,
		adopter = booking.adopter

	return (
		<td className="print:border-x print:border-pink-700 print:p-0.5">
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
	const adopter = booking.adopter

	const notesDict = [
		{
			note: adopter.preferences.applicationComments ?? "",
			source: "From Shelterluv",
		},
		{
			note: adopter.preferences.adopterNotes,
			source: "From " + adopter.demographics.firstName,
		},
		{
			note: adopter.demographics.internalNotes,
			source: "From Adoptions",
		},
	]

	return (
		<td className={"max-w-32 text-xs print:max-w-20 " + className}>
			{notesDict.map((n, i) => (
				<Note key={i} label={n.source} note={n.note} />
			))}
		</td>
	)
}

function AdminNotesCell({ appt }: { appt: ReportingAdminAppointment }) {
	return appt.type == AppointmentType.DONATION_DROP_OFF ? (
		<td className="hidden lg:table-cell print:table-cell print:border-x print:border-pink-700 print:p-0.5">
			<Note label="Appointment" note={appt.notes} />
		</td>
	) : (
		<td className="hidden lg:table-cell print:table-cell"></td>
	)
}

function Note({ label, note, noteClass }: { label: string; note?: string; noteClass?: string }) {
	if (!note) {
		return null
	}

	return (
		<div className="flex flex-col gap-y-0.5 text-[11px]">
			<b>{label}: </b>
			<span className={noteClass}>{note}</span>
		</div>
	)
}

function WatchlistCell({ appointment, className }: { appointment: ReportingAdoptionAppointment; className?: string }) {
	const schedule = useScheduleState()

	if (!appointment.booking) {
		return <td className={"max-w-32 text-xs " + className}></td>
	}

	const { funSize, puppies, adults } = getAvailableTypes(appointment.type, schedule.dateUtil.GetWeekday())
	const watchlist: AdopterWatchlist = appointment.booking.adopter.watchlist

	const notYetAvailableDogs = getNotYetAvailableDogsFromWatchlist(watchlist, schedule.dateUtil, funSize, puppies, adults)

	const noLongerAvailableDogs = watchlist
		.filter((dog) => !dog.availableNow)
		.map((dog) => dog.name)
		.sort((a, b) => a.localeCompare(b))

	const stillAvailableDogs = watchlist
		.filter(
			(dog) => !notYetAvailableDogs.some((d) => d === dog.name) && !noLongerAvailableDogs.some((d) => d === dog.name)
		)
		.map((dog) => dog.name)
		.sort((a, b) => a.localeCompare(b))

	const watchlistDict = [
		{
			label: "Available",
			note: stillAvailableDogs.join(", "),
		},
		{
			label: "Not Yet Available",
			note: notYetAvailableDogs.join(", "),
		},
		{
			label: "No Longer Available",
			note: noLongerAvailableDogs.join(", "),
		},
	]

	return (
		<td className={"max-w-32 text-xs print:max-w-20 " + className}>
			{watchlistDict.map((wl, i) => (
				<Note
					key={i}
					label={wl.label}
					note={wl.note}
					noteClass={
						wl.label === "Not Yet Available"
							? "italic"
							: wl.label === "No Longer Available"
								? "line-through"
								: "font-bold uppercase"
					}
				/>
			))}
		</td>
	)
}
