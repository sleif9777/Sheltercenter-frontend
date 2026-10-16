import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

import { useSessionState } from "../core/session/SessionState"

const initialSession = useSessionState.getState()

afterEach(() => {
	cleanup()
	localStorage.clear()
	useSessionState.setState(initialSession, true)
	vi.restoreAllMocks()
	vi.useRealTimers()
})
