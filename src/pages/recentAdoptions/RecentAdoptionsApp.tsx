import { faFileLines } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect, useState } from "react"

import ReportTable, { ColumnDef, ColumnFormatCallback, Row, Value } from "../../core/components/report/Report"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { RecentAdoption } from "../../models/AppointmentModels"
import { DateTime } from "../../utils/DateTime"

export default function RecentAdoptionsApp() {
	const [rowContent, setRowContent] = useState<Row[]>([])

	const getNameLink: ColumnFormatCallback = useCallback((v?: Value) => {
		const [adopterName, adopterID] = (v?.toString() || "Unknown Adopter").split("^")

		return (
			<a
				className="text-pink-700 hover:text-pink-900 hover:underline"
				href={"/adopters/detail/" + adopterID}
				target="_blank"
			>
				{adopterName}
			</a>
		)
	}, [])

	const getShelterluvLink: ColumnFormatCallback = useCallback((v?: Value) => {
		if (v == "") {
			return
		}

		return (
			<a
				className="text-pink-700 hover:text-pink-900 hover:underline"
				href={`https://new.shelterluv.com/application-request/${v}/print`}
				target="_blank"
			>
				<FontAwesomeIcon icon={faFileLines} />
			</a>
		)
	}, [])

	const columns: ColumnDef[] = [
		{
			header: "Date",
			key: "date",
		},
		{
			header: "Adopter Name",
			key: "name",
			renderFn: (v) => getNameLink(v),
		},
		{
			header: "Email",
			key: "email",
		},
		{
			header: "Dog",
			key: "dog",
		},
		{
			header: "Address",
			key: "fullAddress",
		},
		{
			header: "Shelterluv",
			key: "shelterluv",
			renderFn: (v) => getShelterluvLink(v),
		},
	]

	const fetchAdoptions = useCallback(async () => {
		const resp = await new AppointmentsAPI().GetRecentAdoptions()
		setRowContent(constructRows(resp.adoptions))
	}, [])

	useEffect(() => {
		fetchAdoptions()
	}, [fetchAdoptions])

	return (
		<FullWidthPage title="Recent Adoptions">
			<ReportTable columns={columns} rows={rowContent} />
			<div className="m-auto mt-5 w-[66%] rounded border-2 border-pink-700 bg-pink-200 p-2 text-sm italic">
				This report shows all appointments in the last 10 days with an outcome of Adoption or FTA, as well as all paperwork
				appointments (FTA or Adoption).
			</div>
		</FullWidthPage>
	)
}

function constructRows(adoptions: RecentAdoption[]): Row[] {
	return adoptions.map((a) => {
		return {
			date: new DateTime(a.instant).GetShortDate(),
			dog: a.dog,
			email: a.adopter.primaryEmail,
			fullAddress: `${a.adopter.streetAddress}, ${a.adopter.city}, ${a.adopter.state} ${a.adopter.postalCode}`,
			name: a.adopter.firstName + " " + a.adopter.lastName + "^" + a.adopter.ID,
			shelterluv: a.adopter.shelterluvAppID ?? "",
		}
	})
}
