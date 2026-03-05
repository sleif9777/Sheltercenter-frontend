import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect, useState } from "react"
import { isRouteErrorResponse } from "react-router-dom"

import ReportTable, {
	ColumnDef,
	ColumnFormatCallback,
	ReportActionIconButton,
	Row,
	Value,
} from "../../core/components/report/Report"
import { RecentlyUploadedAdopter } from "../../models/AdopterModels"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"

export default function RecentUploadsApp() {
	const [emailedIDs, setEmailedIDs] = useState<Value[]>([])
	const [rowContent, setRowContent] = useState<Row[]>([])

	const handleResendEmailClick = useCallback(
		async (adopterID: number) => {
			const resp = await new AdoptersAPI().ResendApproval(adopterID)

			if (!isRouteErrorResponse(resp)) {
				const copy = [...emailedIDs, adopterID]
				setEmailedIDs(copy)
			}
		},
		[emailedIDs]
	)

	const getNameLink: ColumnFormatCallback = useCallback((v?: Value) => {
		const [adopterName, adopterID] = (v?.toString() || "Unknown Adopter").split("^")

		return (
			<a className="text-pink-700 hover:text-pink-900 hover:underline" href={"/adopters/manage/" + adopterID}>
				{adopterName}
			</a>
		)
	}, [])

	const getResendEmailButton: ColumnFormatCallback = useCallback(
		(v?: Value) => {
			if (!v) return <>{v}</>

			return (
				<ReportActionIconButton
					disabled={emailedIDs.includes(v)}
					icon={faEnvelope}
					tooltipContent="Resend Email"
					onClick={() => handleResendEmailClick(v as number)}
				/>
			)
		},
		[emailedIDs, handleResendEmailClick]
	)

	const columns: ColumnDef[] = [
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
			header: "Status",
			key: "status",
		},
		{
			header: "Last Uploaded",
			key: "uploadDate",
		},
		{
			header: "",
			key: "actionID",
			renderFn: (v) => getResendEmailButton(v),
		},
	]

	const fetchAdopters = useCallback(async () => {
		const adopters = await new AdoptersAPI().GetRecentlyUploadedAdopters(3)
		setRowContent(constructRows(adopters.adopters))
	}, [])

	useEffect(() => {
		fetchAdopters()
	}, [fetchAdopters])

	return (
		<FullWidthPage title="Recent Uploads">
			<ReportTable columns={columns} rows={rowContent} />
		</FullWidthPage>
	)
}

function constructRows(adopters: RecentlyUploadedAdopter[]): Row[] {
	return adopters.map((a) => {
		return {
			actionID: a.ID.toString(),
			email: a.primaryEmail,
			name: a.disambiguatedName + "^" + a.ID,
			status: a.statusDisplay,
			uploadDate: a.lastUploaded,
		}
	})
}
