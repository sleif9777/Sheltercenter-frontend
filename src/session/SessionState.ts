import { AxiosResponse } from "axios";
import { persistNSync } from "persist-and-sync";
import { create } from "zustand"

import { UserProfilesAPI } from "../apps/login/api/API";
import { SecurityLevel } from "./SecurityLevel";

export interface SessionContext {
    isAuthenticated: boolean,
    accessToken?: string,
    refreshToken?: string,
    message?: string,
    userID?: number,
    userFName?: string,
    userLName?: string,
    securityLevel?: SecurityLevel,
}

interface SessionState extends SessionContext {
    attemptLogIn: (email: string, otp: string) => void,
    logOut: (userID?: number) => void,
    adopterUser: boolean,
    greeterUser: boolean,
    adminUser: boolean,
    sessionExpires?: Date,
}

export const useSessionState = create<SessionState>()(
    persistNSync(
        (set, _) => ({
            isAuthenticated: false,
            adminUser: false,
            adopterUser: false,
            greeterUser: false,
            attemptLogIn: async (email, otp) => {
                const context: AxiosResponse<SessionContext> = await new UserProfilesAPI().AuthenticateOTP(email, otp)

                set(() => ({
                    isAuthenticated: context.data.isAuthenticated,
                    accessToken: context.data.accessToken,
                    refreshToken: context.data.refreshToken,
                    message: context.data.message,
                    userID: context.data.userID,
                    userFName: context.data.userFName,
                    userLName: context.data.userLName,
                    adminUser: (context.data.securityLevel != undefined && 
                        context.data.securityLevel >= SecurityLevel.ADMIN),
                    adopterUser: context.data.securityLevel === SecurityLevel.ADOPTER,
                    greeterUser: context.data.securityLevel === SecurityLevel.GREETER,
                    securityLevel: context.data.securityLevel,
                    sessionExpires: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
                }))
            },
            logOut: async (_) => {                
                set(() => ({
                    isAuthenticated: false,
                    adminUser: false,
                    greeterUser: false,
                    adopterUser: false,
                    securityLevel: undefined,
                    sessionExpires: undefined,
                }))
            },
        }),
        {
            name: 'auth-storage',
        },
    ),
)