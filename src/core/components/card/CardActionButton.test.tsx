import { faEye, faEyeSlash, faWorm } from "@fortawesome/free-solid-svg-icons"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CardActionButton } from "./CardActionButton"

const iconName = () => screen.getByRole("button").querySelector("svg")?.getAttribute("data-icon")

describe("CardActionButton", () => {
	it("follows primaryIcon when the caller changes it", () => {
		const { rerender } = render(<CardActionButton primaryIcon={faEye} primaryTooltipContent="Hide" />)
		expect(iconName()).toBe("eye")

		rerender(<CardActionButton primaryIcon={faWorm} primaryTooltipContent="Show" />)
		expect(iconName()).toBe("worm")
	})

	it("switches to the alt icon on the first click of a toggle", () => {
		render(
			<CardActionButton primaryIcon={faEye} primaryTooltipContent="Hide" toggle={{ altIcon: faEyeSlash, altTooltipContent: "Show", default: false }} />
		)
		expect(iconName()).toBe("eye")

		fireEvent.click(screen.getByRole("button"))
		expect(iconName()).toBe("eye-slash")

		fireEvent.click(screen.getByRole("button"))
		expect(iconName()).toBe("eye")
	})
})
