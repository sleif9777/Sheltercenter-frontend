import { LogInResponse } from "../api/users/Responses"
import { SecurityLevel } from "../enums/UserEnums"

export function makeLogInResponse(security: SecurityLevel, overrides: Partial<LogInResponse> = {}): LogInResponse {
	return {
		accessToken: "access-1",
		isAuthenticated: true,
		refreshToken: "refresh-1",
		user: {
			adopterID: security === SecurityLevel.ADOPTER ? 42 : undefined,
			currentAppt: undefined,
			firstName: "Avery",
			lastName: "Adopter",
			restrictCalendar: false,
			security,
			userID: 7,
		},
		...overrides,
	}
}
