import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSessionState } from "../core/session/SessionState"
import { SecurityLevel } from "../enums/UserEnums"
import { makeLogInResponse } from "../test/fixtures"
import { APIBase } from "./APIBase"

class ThingsAPI extends APIBase {
	constructor() {
		super("Things")
	}
}

function unauthorized() {
	return Object.assign(new Error("401"), { response: { data: {}, status: 401 } })
}

function ok<T>(data: T) {
	return { config: {}, data, headers: {}, status: 200, statusText: "OK" }
}

describe("APIBase", () => {
	beforeEach(() => {
		useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.ADMIN))
	})

	it("builds command paths with a trailing slash and query params", () => {
		const api = new ThingsAPI()
		expect(api.buildCommandPath("GetStuff")).toBe("http://api.test/Things/GetStuff/")
		expect(api.buildCommandPath("GetStuff", { adopterID: 4, includeArchived: false })).toBe(
			"http://api.test/Things/GetStuff/?adopterID=4&includeArchived=false"
		)
	})

	it("sends the session's access token", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(ok({ value: 1 }))
		const data = await new ThingsAPI().buildAndGetData<{ value: number }>("GetStuff")
		expect(data).toEqual({ value: 1 })
		expect(get.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer access-1" })
	})

	it("sends no Authorization header when logged out", async () => {
		useSessionState.getState().endSession()
		const post = vi.spyOn(axios, "post").mockResolvedValue(ok({}))
		await new ThingsAPI().buildAndPost("DoThing", { a: 1 })
		expect(post.mock.calls[0][2]?.headers).not.toHaveProperty("Authorization")
	})

	it("refreshes an expired access token and retries once", async () => {
		const get = vi
			.spyOn(axios, "get")
			.mockRejectedValueOnce(unauthorized())
			.mockResolvedValueOnce(ok({ value: 2 }))
		const post = vi.spyOn(axios, "post").mockResolvedValue(ok({ access: "access-2" }))

		const data = await new ThingsAPI().buildAndGetData<{ value: number }>("GetStuff")

		expect(data).toEqual({ value: 2 })
		expect(post).toHaveBeenCalledWith("http://api.test/auth/token/refresh/", { refresh: "refresh-1" })
		expect(get.mock.calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer access-2" })
		expect(useSessionState.getState().accessToken).toBe("access-2")
	})

	it("retries POSTs after a refresh too", async () => {
		const post = vi
			.spyOn(axios, "post")
			.mockRejectedValueOnce(unauthorized())
			.mockResolvedValueOnce(ok({ access: "access-2" }))
			.mockResolvedValueOnce(ok({ saved: true }))

		const resp = await new ThingsAPI().buildAndPost("DoThing", { a: 1 })

		expect(resp.data).toEqual({ saved: true })
		expect(post.mock.calls[2][2]?.headers).toMatchObject({ Authorization: "Bearer access-2" })
	})

	it("ends the session when the refresh token is rejected", async () => {
		vi.spyOn(axios, "get").mockRejectedValue(unauthorized())
		vi.spyOn(axios, "post").mockRejectedValue(unauthorized())

		await expect(new ThingsAPI().buildAndGetData("GetStuff")).rejects.toThrow("Session expired")
		expect(useSessionState.getState().isAuthenticated).toBe(false)
		expect(useSessionState.getState().refreshToken).toBeUndefined()
	})

	it("keeps a newer login if it happened while a refresh was failing", async () => {
		vi.spyOn(axios, "get").mockRejectedValue(unauthorized())
		vi.spyOn(axios, "post").mockImplementation(async () => {
			useSessionState.getState().setUpSession(makeLogInResponse(SecurityLevel.ADMIN, { accessToken: "new-a", refreshToken: "new-r" }))
			throw unauthorized()
		})

		await expect(new ThingsAPI().buildAndGetData("GetStuff")).rejects.toThrow("Session expired")
		expect(useSessionState.getState().refreshToken).toBe("new-r")
		expect(useSessionState.getState().isAuthenticated).toBe(true)
	})

	it("returns non-401 error responses instead of throwing", async () => {
		vi.spyOn(axios, "get").mockRejectedValue(Object.assign(new Error("409"), { response: { data: { reason: "conflict" }, status: 409 } }))
		const resp = await new ThingsAPI().buildAndGetFullResponse("GetStuff")
		expect(resp.status).toBe(409)
	})
})
