// import { useCallback, useEffect, useState } from "react"
// import { useParams } from "react-router-dom"

// import { AppointmentIDProps, ReportingAdoptionAppointment } from "../../aamodels/AppointmentModels"
// import { AppointmentsAPI } from "../../aapi/appointments/AppointmentsAPI"
// import { DateTime } from "../../aautils/DateTime"
// import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
// import { ApptInstantCell, ReportRowComponentProps } from "../printView/PrintViewApp"
// import { ScheduleAppTitle } from "../schedule/ScheduleApp"
// import { useScheduleState } from "../schedule/ScheduleAppState"

// export default function DailyReportApp() {
// 	const { date } = useParams()
// 	const schedule = useScheduleState()

// 	useEffect(() => {
// 		schedule.refresh(date)
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [])

// 	const displayAppts = (schedule.apptHash ?? []).flatMap((t) => t.value).filter((a) => a.hasCurrentBooking)

// 	return (
// 		<FullWidthPage subtitle="Daily Report" title={<ScheduleAppTitle />}>
// 			<div className="mx-2 mt-3 border-t border-pink-700 pt-3">
// 				<table className="w-full text-left">
// 					<thead className="text-lg underline">
// 						<tr>
// 							<th>Time</th>
// 							<th>Adopter</th>
// 							<th>Check-In</th>
// 							<th>Counselor</th>
// 							<th>Check-Out</th>
// 							<th>Outcome</th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 						{displayAppts.map((a, i) => (
// 							<DailyReportRow ID={a.ID} isLast={i == displayAppts.length - 1} key={i} />
// 						))}
// 					</tbody>
// 				</table>
// 			</div>
// 		</FullWidthPage>
// 	)
// }

// export function DailyReportRow({ ID: apptID, isLast }: ReportRowComponentProps) {
// 	const [appt, setAppt] = useState<ReportingAdoptionAppointment>()

// 	const fetchData = useCallback(async () => {
// 		const resp = await new AppointmentsAPI().GetReportingAppointment<ReportingAdoptionAppointment>(apptID)
// 		setAppt(resp.apptData)
// 	}, [apptID])

// 	useEffect(() => {
// 		fetchData()
// 	}, [fetchData])

// 	if (!appt) {
// 		return
// 	}

// 	const booking = appt.booking,
// 		adopter = booking.adopter

// 	return (
// 		<tr className={"align-top hover:bg-pink-200 " + (isLast ? "" : "border-b border-pink-700")}>
// 			<ApptInstantCell appt={appt} />
// 			<td>
// 				{adopter.demographics.firstName} {adopter.demographics.lastName}
// 			</td>
// 			<td>{appt.checkInTime ?? ""}</td>
// 			<td>{appt.counselor}</td>
// 			<td>{appt.checkOutTime ?? ""}</td>
// 			<td>
// 				{appt.outcomeDisplay} {appt.chosenDog && `${appt.chosenDog}`}
// 			</td>
// 		</tr>
// 	)
// }

import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { ReportRowComponentProps, useReportingAppointment } from "../../core/components/report/UseReportingHook"
import { ReportingAdoptionAppointment } from "../../models/AppointmentModels"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { ApptInstantCell } from "../printView/PrintViewApp"
import { ScheduleAppTitle } from "../schedule/ScheduleApp"
import { useScheduleState } from "../schedule/ScheduleAppState"

export default function DailyReportApp() {
	const { date } = useParams()
	const schedule = useScheduleState()

	useEffect(() => {
		schedule.refresh(date)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const displayAppts = (schedule.apptHash ?? []).flatMap((t) => t.value).filter((a) => a.hasCurrentBooking)

	return (
		<FullWidthPage subtitle="Daily Report" title={<ScheduleAppTitle />}>
			<div className="mx-2 mt-3 border-t border-pink-700 pt-3">
				<table className="w-full text-left">
					<thead className="text-lg underline">
						<tr>
							<th>Time</th>
							<th>Adopter</th>
							<th>Check-In</th>
							<th>Counselor</th>
							<th>Check-Out</th>
							<th>Outcome</th>
						</tr>
					</thead>
					<tbody>
						{displayAppts.map((a, i) => (
							<DailyReportRow ID={a.ID} isLast={i == displayAppts.length - 1} key={i} />
						))}
					</tbody>
				</table>
			</div>
		</FullWidthPage>
	)
}

export function DailyReportRow({ ID: apptID, isLast }: ReportRowComponentProps) {
	const { appt } = useReportingAppointment<ReportingAdoptionAppointment>(apptID)

	if (!appt) {
		return null
	}

	const booking = appt.booking,
		adopter = booking.adopter

	return (
		<tr className={"align-top hover:bg-pink-200 " + (isLast ? "" : "border-b border-pink-700")}>
			<ApptInstantCell appt={appt} />
			<td>
				{adopter.demographics.firstName} {adopter.demographics.lastName}
			</td>
			<td>{appt.checkInTime ?? ""}</td>
			<td>{appt.counselor}</td>
			<td>{appt.checkOutTime ?? ""}</td>
			<td>
				{appt.outcomeDisplay} {appt.chosenDog && `${appt.chosenDog}`}
			</td>
		</tr>
	)
}
