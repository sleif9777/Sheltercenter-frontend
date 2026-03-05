import { useCallback, useEffect, useState } from "react"

import { ReportingAppointment } from "../../../models/AppointmentModels"
import { AppointmentsAPI } from "../../../api/appointments/AppointmentsAPI"

export interface ReportRowComponentProps {
	ID: number
	isLast?: boolean
}

/**
 * Hook to fetch reporting appointment data
 */
export function useReportingAppointment<T extends ReportingAppointment>(apptID: number) {
	const [appt, setAppt] = useState<T>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error>()

	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			const resp = await new AppointmentsAPI().GetReportingAppointment<T>(apptID)
			setAppt(resp.apptData)
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch appointment"))
		} finally {
			setLoading(false)
		}
	}, [apptID])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	return { appt, error, loading, refetch: fetchData }
}
