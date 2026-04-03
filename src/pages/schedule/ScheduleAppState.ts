import { AxiosError } from "axios"
import { create } from "zustand"

import { useSessionState } from "../../core/session/SessionState"
import { AppointmentHash } from "../../models/AppointmentModels"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { DateTime } from "../../utils/DateTime"
import { StringUtils } from "../../utils/StringUtils"

export type ScheduleContext = {
	apptHash?: AppointmentHash[]
	hasAvailableAppts: boolean
	isClosedDate: boolean
	isoDate: string
}

export interface ScheduleState extends ScheduleContext {
	contextLoadFailed: boolean
	dateUtil: DateTime
	failedLoadResp?: AxiosError
	loadingAppointments: boolean
	getDayDiff: () => number
	isToday: () => boolean
	isUnschedulable: () => boolean
	isPast: () => boolean
	isPastCloseTime: () => boolean
	isUserCurrentApptDate: () => boolean
	refresh: (newDateISO?: string) => void
}

export const useScheduleState = create<ScheduleState>((set, get) => {
	const today = new DateTime()

	return {
		contextLoadFailed: false,
		dateUtil: today,
		hasAvailableAppts: false,
		isClosedDate: false,
		isoDate: today.GetISODate(),
		loadingAppointments: false,

		// eslint-disable-next-line sort-keys
		getDayDiff: (compareDate?: DateTime) => {
			const { dateUtil } = get()

			return dateUtil.DiffWithDate(compareDate ?? today)
		},

		isPast: () => {
			const { getDayDiff, isPastCloseTime } = get()

			return getDayDiff() < 0 || isPastCloseTime()
		},

		isPastCloseTime: () => {
			const { dateUtil, isToday } = get()

			return isToday() && dateUtil.CloseTime().isBefore(dateUtil.instant)
		},

		isToday: () => {
			const { dateUtil } = get()
			return dateUtil.GetISODate() == today.GetISODate()
		},

		// unschedulable = over 14 days away
		isUnschedulable: () => {
			const { getDayDiff } = get()

			return getDayDiff() > 14
		},

		isUserCurrentApptDate: () => {
			const { isoDate } = get(),
				session = useSessionState.getState()

			return session.user?.currentAppt?.isoDate == isoDate
		},

		refresh: async (newISODate?: string) => {
			const session = useSessionState.getState()

			const prev = get()
			const effectiveISO = StringUtils.isNotNull(newISODate) ? newISODate : prev.isoDate
			const nextDateUtil = new DateTime(effectiveISO)

			// Update state FIRST
			set({
				dateUtil: nextDateUtil,
				isoDate: effectiveISO,
				loadingAppointments: true,
			})

			try {
				const resp = await new AppointmentsAPI().GetContextForDate(nextDateUtil, session.user?.userID ?? 0)

				const context = resp.data
				// Success (we only get here if status is 2xx)
				set({
					apptHash: context.apptHash,
					contextLoadFailed: false,
					failedLoadResp: undefined,
					hasAvailableAppts: context.hasAvailableAppts,
					isClosedDate: context.isClosedDate,
					loadingAppointments: false,
				})
			} catch (error) {
				// Strongly type the error
				if (error instanceof AxiosError) {
					set({
						contextLoadFailed: true,
						failedLoadResp: error,
						loadingAppointments: false,
					})
				} else {
					// Network error or other non-Axios issue
					set({
						contextLoadFailed: true,
						failedLoadResp: undefined,
						loadingAppointments: false,
					})
				}
			}
		},
	}
})
