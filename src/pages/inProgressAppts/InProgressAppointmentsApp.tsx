import moment from "moment"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { AppointmentIDProps, ReportingAdoptionAppointment } from "../../models/AppointmentModels"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { ApptInstantCell } from "../printView/PrintViewApp"
import { ScheduleAppTitle } from "../schedule/ScheduleApp"
import { useScheduleState } from "../schedule/ScheduleAppState"

export default function InProgressAppointmentsApp() {
	const { date } = useParams()
	const schedule = useScheduleState()

	useEffect(() => {
		schedule.refresh(date)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const displayAppts = (schedule.apptHash ?? []).flatMap((t) => t.value).filter((a) => a.isInProgress)

	return (
		<FullWidthPage subtitle="In-Progress Appointments" title={<ScheduleAppTitle />}>
			<div className="mx-2 mt-3 border-t border-pink-700 pt-3">
				<table className="w-full text-left">
					<thead className="text-lg underline">
						<tr>
							<th>Appointment Time</th>
							<th>Adopter</th>
							<th>Check-In</th>
							<th>Counselor</th>
							<th>Clothing Description</th>
						</tr>
					</thead>
					<tbody>
						{displayAppts.map((a) => (
							<InProgressAppointmentRow ID={a.ID} />
						))}
					</tbody>
				</table>
			</div>
		</FullWidthPage>
	)
}

function InProgressAppointmentRow({ ID: apptID }: AppointmentIDProps) {
	const [appt, setAppt] = useState<ReportingAdoptionAppointment>()

	const fetchData = useCallback(async () => {
		const resp = await new AppointmentsAPI().GetReportingAppointment<ReportingAdoptionAppointment>(apptID)
		setAppt(resp.apptData)
	}, [apptID])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	if (!appt) {
		return
	}

	const booking = appt.booking,
		adopter = booking.adopter

	return (
		<tr className="align-top hover:border-pink-200 hover:bg-pink-200">
			<ApptInstantCell appt={appt} />
			<td>
				{adopter.demographics.firstName} {adopter.demographics.lastName}
			</td>
			<td>
				<div>
					{appt.checkInTime}
					<div className="text-xs italic">({calcAppointmentDuration(appt)})</div>
				</div>
			</td>
			<td>{appt.counselor}</td>
			<td>{appt.clothingDescription}</td>
		</tr>
	)
}

function calcAppointmentDuration(appt: ReportingAdoptionAppointment) {
	const today = moment().format("YYYY-MM-DD")
	const startTime = moment(`${today} ${appt.checkInTime}`, "YYYY-MM-DD hh:mm A")
	const endTime = moment()
	const duration = moment.duration(endTime.diff(startTime))

	return `${Math.trunc(duration.asHours())}h ${Math.trunc(duration.asMinutes() % 60)}m ago`
}
