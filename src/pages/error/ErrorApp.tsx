import { faFrown } from "@fortawesome/free-solid-svg-icons"
import { AxiosError } from "axios"
import { useCallback } from "react"

import { LargeButton } from "../../core/components/buttons/LargeButton"
import { useSessionState } from "../../core/session/SessionState"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { DateTime } from "../../utils/DateTime"

export function ErrorDisplay({ error }: { error: AxiosError }) {
	// Extract numeric code if possible
	const numericCode = error.response?.status || (error.code ? parseInt(error.code.replace(/\D/g, "")) : null)

	// Format stack trace
	const formattedStack = error.stack?.split("\n").map((line, index) => (
		<div className="pl-4" key={index}>
			{line.trim()}
		</div>
	))

	return (
		<div className="mx-5 my-2 rounded border border-red-200 bg-red-50 p-4">
			<h2 className="text-xl font-bold text-red-800">Error Details</h2>
			<h3 className="mb-3">Admin-facing only: send this to Sam!</h3>

			<div className="space-y-3">
				<div>
					<h3 className="font-semibold text-red-700">Message:</h3>
					<p className="text-red-900">{error.message}</p>
				</div>

				<div>
					<h3 className="font-semibold text-red-700">Code:</h3>
					<p className="text-red-900">{numericCode || error.code || "N/A"}</p>
				</div>

				<div>
					<h3 className="font-semibold text-red-700">URL:</h3>
					<p className="break-all text-red-900">{error.config?.url}</p>
				</div>

				<div>
					<h3 className="font-semibold text-red-700">Stack Trace:</h3>
					<div className="overflow-x-auto rounded border border-gray-800 bg-gray-100 p-2 font-mono text-xs text-gray-800">
						{formattedStack}
					</div>
				</div>
			</div>
		</div>
	)
}

export function ErrorApp({ errorObj, scheduleDate }: { errorObj?: AxiosError; scheduleDate?: DateTime }) {
	const session = useSessionState(),
		downloadDate = (scheduleDate ?? new DateTime()).GetISODate()

	const handleDownloadClick = useCallback(async () => {
		await new AppointmentsAPI().GetContinuityAccessSpreadsheet(downloadDate)
	}, [downloadDate])

	return (
		<>
			<PlaceholderText iconDef={faFrown} text="Something went wrong. Try again in a few minutes." />
			{session.adminUser && errorObj && (
				<div className="flex flex-col gap-y-1">
					{<LargeButton label={getDownloadButtonLabel(scheduleDate)} onClick={handleDownloadClick} />}
					<ErrorDisplay error={errorObj} />
				</div>
			)}
		</>
	)
}

function getDownloadButtonLabel(scheduleDate?: DateTime) {
	if (scheduleDate && !scheduleDate.IsToday()) {
		return "Download Schedule for " + scheduleDate.GetShortDate() + " and Chosen Board"
	}

	return "Download Today's Schedule and Chosen Board"
}
