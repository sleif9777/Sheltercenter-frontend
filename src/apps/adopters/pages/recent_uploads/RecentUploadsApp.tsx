import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect, useState } from "react"
import { isRouteErrorResponse } from "react-router-dom"

import ReportTable, { ColumnDef, ColumnFormatCallback, ReportActionIconButton, Row, Value } from "../../../../components/report/Report"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import { AdopterAPI } from "../../api/API"
import { AdopterApprovalStatusDisplay } from "../../enums/AdopterEnums"
import { IAdopterBase } from "../../models/Adopter"

import "../print_view/ReportingPage.scss"

export default function RecentUploadsApp() {
	const [emailedIDs, setEmailedIDs] = useState<string[]>([])
	const [rowContent, setRowContent] = useState<Row[]>([])
	const columns: ColumnDef[] = [
		{ key: "name", header: "Adopter Name", renderFn: v => getNameLink(v) },
		{ key: "email", header: "Email" },
		{ key: "status", header: "Status" },
		{ key: "uploadDate", header: "Last Uploaded" },
		{ key: "actions", header: "", renderFn: () => getResendEmailButton() }
	]

	const getNameLink: ColumnFormatCallback = useCallback((v?: Value) => {
		const [adopterName, adopterID] = (v?.toString() || "Unknown Adopter").split("^")

		return <a href={adopterID}>{adopterName}</a>
	}, [])

	const getResendEmailButton: ColumnFormatCallback = useCallback((adopterID?: Value) => {
		if (!adopterID) return <></>

		return <ReportActionIconButton
			actionName="resendEmail"
			disabled={emailedIDs.includes(adopterID)}
			icon={faEnvelope}
			onClick={() => handleResendEmailClick(adopterID)}
			tooltipContent="Resend Email"
		/>
	}, [])

	const handleResendEmailClick = useCallback(async (adopterID: string) => {
		const resp = await new AdopterAPI().ResendApproval(adopterID)

		if (!isRouteErrorResponse(resp)) {
			const copy = [...emailedIDs, adopterID]
			setEmailedIDs(copy)
		}
	}, [])

	const fetchAdopters = useCallback(async () => {
		const respData = (await new AdopterAPI().GetRecentlyUploadedAdopters(3)).data
		setRowContent(constructRows(respData.adopters))
	}, [])

	useEffect(() => {
		fetchAdopters()
	}, [])

	return <FullWidthPage title="Recently Uploaded Adopters">
		<ReportTable columns={columns} rows={rowContent} />
	</FullWidthPage>
}

function constructRows(adopters: IAdopterBase[]): Row[] {
	return adopters.map(a => {
		return {
			name: a.fullName + "^" + a.ID,
			email: a.primaryEmail,
			status: AdopterApprovalStatusDisplay[a.status],
			uploadDate: a.uploadDate,
			actionID: a.ID.toString()
		}
	})
}