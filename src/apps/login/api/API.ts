import { API } from "../../../api/API"

export class UserProfilesAPI extends API {
    constructor() {
        super("UserProfiles")
    }

    GetCurrentAuth(userID?: number) {
        const path = this.buildCommandPath("GetCurrentAuth")
        return this.post(path, { userID: userID })
    }

    AuthenticateOTP(email: string, otp: string) {
        const data = {
            email: email,
            otp: otp
        }
        const path = this.buildCommandPath("AuthenticateOTP")

        return this.post(path, data)
    }

    LogOut(userID: number) {
        const data = {
            userID: userID,
        }
        const path = this.buildCommandPath("LogOut")

        return this.post(path, data)
    }

    GenerateOTP(email: string) {
        const data = {
            email: email,
        }
        const path = this.buildCommandPath("GenerateOTP")
        return this.post(path, data)
    }

    SpreadsheetImportBatch(batchFile: Blob) {
        const data = new FormData()
        data.append("batchFile", batchFile)

        const path = this.buildCommandPath("SpreadsheetImportBatch")

        return this.post(path, data)
    }

    SaveAdopterByForm(data: {}) {
        const path = this.buildCommandPath("SaveAdopterByForm")
        return this.post(path, data)
    }

    UpdatePrimaryEmail(data: {}) {
        const path = this.buildCommandPath("UpdatePrimaryEmail")
        return this.post(path, data)
    }
}