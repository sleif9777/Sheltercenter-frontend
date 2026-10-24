import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DashboardDog } from "../../models/DogModels"
import { useDashboardsState } from "./DashboardsAppState"

const dog = (ID: number, name: string): DashboardDog => ({ hidden: false, ID, name, photoURL: "" })

describe("useDashboardsState.setDogHidden", () => {
	beforeEach(() => {
		useDashboardsState.setState({
			dogHash: {
				chosen: { needsSN: [], needsWC: [], readyToRoll: [] },
				fta: [dog(1, "Mango")],
				newlyInHome: [dog(2, "Juniper")],
			},
		})
	})

	it("hides the dog and posts the change", async () => {
		const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 200 })

		expect(await useDashboardsState.getState().setDogHidden(1, true)).toBe(true)

		expect(useDashboardsState.getState().dogHash.fta[0].hidden).toBe(true)
		expect(useDashboardsState.getState().dogHash.newlyInHome[0].hidden).toBe(false)
		expect(post).toHaveBeenCalledWith(expect.stringContaining("/Dogs/SetDashboardHidden/"), { dogID: 1, hidden: true }, expect.anything())
	})

	it("reverts when the save fails", async () => {
		// APIBase resolves with the error rather than rejecting
		vi.spyOn(axios, "post").mockResolvedValue({ data: {}, status: 403 })

		expect(await useDashboardsState.getState().setDogHidden(2, true)).toBe(false)

		expect(useDashboardsState.getState().dogHash.newlyInHome[0].hidden).toBe(false)
	})
})
