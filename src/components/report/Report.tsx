import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import { ButtonProps } from "rsuite";

import { AreYouSure } from "../modals/AreYouSure";

import "./Report.scss"

export function InProgressAppointmentsApp() {
	// const { date } = useParams()
	// const viewDate = (date == ":date") ? moment(new Date()) : moment(date)

	// useEffect(() => {
	//     store.refresh(viewDate.toDate(), [])
	// }, [])

	// var appointments: Appointment[] = []
	// const timeslots = store.timeslots

	// timeslots.forEach(t => {
	//     const newAppts = t.appointments
	//         .map(a => new Appointment(a as IAppointment))
	//         .filter(a => a.getCurrentBooking() && 
	//             (a.checkInTime) && 
	//             (!a.checkOutTime))
	//     appointments = appointments.concat(newAppts)
	// })

	// function calcAppointmentDuration(appointment: Appointment) {
	//     var startTime = moment(appointment.checkInTime)
	//     var endTime = moment(new Date())
	//     var duration = moment.duration(endTime.diff(startTime));

	//     return `${Math.trunc(duration.asHours())}h ${Math.trunc(duration.asMinutes() % 60)}m ago`
	// }

	// return <table className="report">
	// 	<tr className="no-border">
	// 		<th>Appointment Time</th>
	// 		<th>Adopter</th>
	// 		<th>Check-In</th>
	// 		<th>Counselor</th>
	// 		<th>Clothing Description</th>
	// 	</tr>
	// 	{appointments.map(a => {
	// 		return <tr>
	// 			<td>{moment(a.instant).format("h:mm A")}</td>
	// 			<td>{a.getCurrentBooking()!.adopter.getFullName()}</td>
	// 			<td>
	// 				{moment(a.checkInTime).format("h:mm A")}<br />
	// 				<span className="small-detail">{calcAppointmentDuration(a)}</span>
	// 			</td>
	// 			<td>{a.counselor}</td>
	// 			<td>{a.clothingDescription}</td>
	// 		</tr>
	// 	})}
	// </table>
}

export type Value = string | null

export type Row = Record<string, Value>

export type ColumnDef = {
	key: string
	header: string
	renderFn?: ColumnFormatCallback
}

export type ColumnFormatCallback = (value?: Value) => JSX.Element

export type ReportTableProps = {
	columns: ColumnDef[]
	rows: Row[]
}

export default function ReportTable({ columns, rows }: ReportTableProps) {
	return <table>
		<thead>
			<tr>
				{columns.map(col =>
					<th key={col.key}>{col.header}</th>
				)}
			</tr>
		</thead>

		<tbody>
			{rows.map((row, i) =>
				<tr key={i}>
					{columns.map(col => <>
						<td key={col.key}>
							{col.renderFn
								? col.renderFn(row[col.key])
								: row[col.key] ?? ""}
						</td>
					</>
					)}
				</tr>
			)}
		</tbody>
	</table>
}

interface ReportActionIconButtonProps extends ButtonProps {
	actionName: string,
	areYouSureOptions?: {
		modalTitle: string,
		youWantTo: string
	},
	elementID?: string,
	icon: IconDefinition,
	tooltipContent: string,
}

export function ReportActionIconButton(props: ReportActionIconButtonProps) {
	const { actionName, areYouSureOptions, elementID, icon, onClick, tooltipContent } = props

	if (areYouSureOptions) {
		return <AreYouSure
			youWantTo={areYouSureOptions.youWantTo}
			buttonClass="report-action"
			buttonId={actionName + "^" + elementID}
			launchBtnLabel={<FontAwesomeIcon icon={icon} />}
			modalTitle={areYouSureOptions.modalTitle}
			tooltipText={tooltipContent}
		/>
	}

	return <>
		<button
			className="chosen-board-action"
			data-tooltip-id={elementID + "-ttp"}
			id={elementID}
			onClick={onClick}
		>
			<FontAwesomeIcon icon={icon} />
		</button>
		{tooltipContent && elementID && <Tooltip
			anchorSelect={"#" + elementID}
			id={elementID + "-ttp"}
			content={tooltipContent}
			place="bottom-start"
		/>}
	</>
}