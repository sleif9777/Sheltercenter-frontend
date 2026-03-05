import { create } from "zustand"
import { persist } from "zustand/middleware"

import { SecurityLevel } from "../../enums/UserEnums"
import { IAppointment } from "../../models/AppointmentModels"
import { IUser } from "../../models/UserModels"
import { LogInResponse } from "../../api/users/Responses"
import { DateTime } from "../../utils/DateTime"

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
	setUpSession: (resp: LogInResponse) => void
	validateSession: () => boolean
	adminUser: boolean
	adopterUser: boolean
	greeterUser: boolean
	sessionExpires?: string
	acknowledgements: {
		watchlist: boolean
		// TODO: add other user-warning acknowledgements here as needed
	}
}

export const useSessionState = create<SessionState>()(
	persist(
		(set, get) => ({
			isAuthenticated: false,

			// eslint-disable-next-line sort-keys
			adminUser: false,
			adopterUser: false,
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
					greeterUser: state.greeterUser,
					isAuthenticated: state.isAuthenticated,
					refreshToken: state.refreshToken,
					sessionExpires: state.sessionExpires,
					user: state.user,
				}))
			},

			endSession: () => {
				set((state) => ({
					accessToken: undefined,
					acknowledgements: state.acknowledgements,
					adminUser: false,
					adopterUser: false,
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
							},
						},
					}
				})
			},

			setUpSession: async (resp: LogInResponse) => {
				set(() => ({
					accessToken: resp.accessToken,
					acknowledgements: {
						watchlist: resp.user.security !== SecurityLevel.ADOPTER,
					},
					adminUser: (resp.user.security ?? SecurityLevel.ADOPTER) >= SecurityLevel.ADMIN,
					adopterUser: resp.user.security === SecurityLevel.ADOPTER,
					greeterUser: resp.user.security === SecurityLevel.GREETER,
					isAuthenticated: resp.isAuthenticated,
					refreshToken: resp.refreshToken,
					sessionExpires: getExpiration(),
					user: resp.user,
				}))
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

		const expectedAdminUser = (state.user.security ?? SecurityLevel.ADOPTER) >= SecurityLevel.ADMIN
		const expectedAdopterUser = state.user.security === SecurityLevel.ADOPTER
		const expectedGreeterUser = state.user.security === SecurityLevel.GREETER

		if (
			state.adminUser !== expectedAdminUser ||
			state.adopterUser !== expectedAdopterUser ||
			state.greeterUser !== expectedGreeterUser ||
			state.isAuthenticated !== true
		) {
			useSessionState.setState({
				adminUser: expectedAdminUser,
				adopterUser: expectedAdopterUser,
				greeterUser: expectedGreeterUser,
				isAuthenticated: true,
			})
		}
	}
})

function getExpiration(): string {
	const dt = new DateTime()
	dt.instant.add(7, "days")
	return dt.instant.toISOString()
}
