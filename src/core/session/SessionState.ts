import { create } from "zustand"
import { persist } from "zustand/middleware"

import { SecurityLevel } from "../../enums/UserEnums"
import { IAppointment } from "../../models/AppointmentModels"
import { IUser } from "../../models/UserModels"
import { LogInResponse } from "../../api/users/Responses"
import { DateTime } from "../../utils/DateTime"

export interface DashboardPreferences {
	cycleEnabled: boolean
	hideNav: boolean
}

const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
	cycleEnabled: false,
	hideNav: true,
}

export interface SessionContext {
	isAuthenticated: boolean
	accessToken?: string
	refreshToken?: string
	message?: string
	user?: IUser
}

export interface SessionState extends Omit<SessionContext, "securityLevel"> {
	acknowledgeWatchlist: () => void
	endSession: () => void
	logOut: (userID?: number) => void
	removeCurrentAppt: () => void
	setCurrentAppt: (appt: IAppointment) => void
	setDashboardPreferences: (patch: Partial<DashboardPreferences>) => void
	setUpSession: (resp: LogInResponse) => void
	updateAccessToken: (token: string) => void
	validateSession: () => boolean
	adminUser: boolean
	adopterUser: boolean
	dashboardUser: boolean
	greeterUser: boolean
	sessionExpires?: string
	acknowledgements: {
		watchlist: boolean
		// TODO: add other user-warning acknowledgements here as needed
	}
	dashboardPreferences: DashboardPreferences
}

export const useSessionState = create<SessionState>()(
	persist(
		(set, get) => ({
			isAuthenticated: false,

			// eslint-disable-next-line sort-keys
			adminUser: false,
			adopterUser: false,
			dashboardUser: false,
			greeterUser: false,

			// eslint-disable-next-line sort-keys
			acknowledgements: {
				watchlist: false,
			},

			acknowledgeWatchlist: () => {
				set((state) => ({
					accessToken: state.accessToken,
					acknowledgements: {
						...state.acknowledgements,
						watchlist: true,
					},
					adminUser: state.adminUser,
					adopterUser: state.adopterUser,
					dashboardPreferences: state.dashboardPreferences,
					dashboardUser: state.dashboardUser,
					greeterUser: state.greeterUser,
					isAuthenticated: state.isAuthenticated,
					refreshToken: state.refreshToken,
					sessionExpires: state.sessionExpires,
					user: state.user,
				}))
			},

			dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,

			endSession: () => {
				set((state) => ({
					accessToken: undefined,
					acknowledgements: state.acknowledgements,
					adminUser: false,
					adopterUser: false,
					dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,
					dashboardUser: false,
					greeterUser: false,
					isAuthenticated: false,
					refreshToken: undefined,
					sessionExpires: undefined,
					user: undefined,
				}))
			},

			hasCurrentAppointment: () => {
				const user = get().user
				return user?.currentAppt?.ID != null
			},

			logOut: async (_) => {
				set(() => ({
					accessToken: undefined,
					acknowledgements: { watchlist: false },
					adminUser: false,
					adopterUser: false,
					dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,
					dashboardUser: false,
					greeterUser: false,
					isAuthenticated: false,
					refreshToken: undefined,
					sessionExpires: undefined,
					user: undefined,
				}))
			},

			removeCurrentAppt: () => {
				set((state) => {
					if (!state.user) return state
					return {
						accessToken: state.accessToken,
						acknowledgements: state.acknowledgements,
						adminUser: state.adminUser,
						adopterUser: state.adopterUser,
						dashboardPreferences: state.dashboardPreferences,
						dashboardUser: state.dashboardUser,
						greeterUser: state.greeterUser,
						isAuthenticated: state.isAuthenticated,
						refreshToken: state.refreshToken,
						sessionExpires: state.sessionExpires,
						user: {
							...state.user,
							currentAppt: undefined,
						},
					}
				})
			},

			setCurrentAppt: (appt: IAppointment) => {
				set((state) => {
					if (!state.user) return state
					return {
						accessToken: state.accessToken,
						acknowledgements: state.acknowledgements,
						adminUser: state.adminUser,
						adopterUser: state.adopterUser,
						dashboardPreferences: state.dashboardPreferences,
						dashboardUser: state.dashboardUser,
						greeterUser: state.greeterUser,
						isAuthenticated: state.isAuthenticated,
						refreshToken: state.refreshToken,
						sessionExpires: state.sessionExpires,
						user: {
							...state.user,
							currentAppt: {
								ID: appt.ID,
								instantDisplay: appt.instantDisplay,
								isoDate: appt.isoDate,
								isoInstant: appt.isoInstant,
							},
						},
					}
				})
			},

			setDashboardPreferences: (patch: Partial<DashboardPreferences>) => {
				set((state) => ({
					dashboardPreferences: {
						...state.dashboardPreferences,
						...patch,
					},
				}))
			},

			setUpSession: async (resp: LogInResponse) => {
				const s = resp.user.security ?? SecurityLevel.ADOPTER
				set(() => ({
					accessToken: resp.accessToken,
					acknowledgements: {
						watchlist: resp.user.security !== SecurityLevel.ADOPTER,
					},
					adminUser: s === SecurityLevel.ADMIN || s === SecurityLevel.SUPERUSER,
					adopterUser: s === SecurityLevel.ADOPTER,
					dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,
					dashboardUser: s === SecurityLevel.DASHBOARD,
					greeterUser: s === SecurityLevel.GREETER,
					isAuthenticated: resp.isAuthenticated,
					refreshToken: resp.refreshToken,
					sessionExpires: getExpiration(s),
					user: resp.user,
				}))
			},

			updateAccessToken: (token: string) => {
				set((state) => ({ ...state, accessToken: token }))
			},

			validateSession: () => {
				const state = get()
				if (!state.isAuthenticated || !state.sessionExpires) {
					return false
				}

				const now = new DateTime()
				if (now.instant.isAfter(state.sessionExpires)) {
					get().endSession()
					return false
				}
				return true
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				accessToken: state.accessToken,
				acknowledgements: state.acknowledgements,
				adminUser: state.adminUser,
				adopterUser: state.adopterUser,
				dashboardPreferences: state.dashboardPreferences,
				dashboardUser: state.dashboardUser,
				greeterUser: state.greeterUser,
				isAuthenticated: state.isAuthenticated,
				refreshToken: state.refreshToken,
				sessionExpires: state.sessionExpires,
				user: state.user,
			}),
		}
	)
)

// Subscribe to state changes and fix derived flags
useSessionState.subscribe((state) => {
	if (state.user && state.accessToken && state.sessionExpires) {
		const now = new DateTime()
		const isExpired = now.instant.isAfter(state.sessionExpires)

		if (isExpired) {
			useSessionState.getState().endSession()
			return
		}

		const s = state.user.security ?? SecurityLevel.ADOPTER
		const expectedAdminUser = s === SecurityLevel.ADMIN || s === SecurityLevel.SUPERUSER
		const expectedAdopterUser = s === SecurityLevel.ADOPTER
		const expectedDashboardUser = s === SecurityLevel.DASHBOARD
		const expectedGreeterUser = s === SecurityLevel.GREETER

		if (
			state.adminUser !== expectedAdminUser ||
			state.adopterUser !== expectedAdopterUser ||
			state.dashboardUser !== expectedDashboardUser ||
			state.greeterUser !== expectedGreeterUser ||
			state.isAuthenticated !== true
		) {
			useSessionState.setState({
				adminUser: expectedAdminUser,
				adopterUser: expectedAdopterUser,
				dashboardUser: expectedDashboardUser,
				greeterUser: expectedGreeterUser,
				isAuthenticated: true,
			})
		}
	}
})

function getExpiration(security: SecurityLevel): string {
	const dt = new DateTime()
	dt.instant.add(security === SecurityLevel.DASHBOARD ? 28 : 7, "days")
	return dt.instant.toISOString()
}
