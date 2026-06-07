import { ReactNode } from "react"

import { AppFooter } from "../../core/components/Footer"
import { Toolbar, ToolbarElement } from "../Toolbar/Toolbar"

export default function FullWidthPage({
	children,
	smallerSubtitle,
	subtitle,
	title,
	toolbarItems,
}: {
	children: ReactNode
	title?: ReactNode
	smallerSubtitle?: boolean
	subtitle?: string
	toolbarItems?: ToolbarElement[]
}) {
	return (
		<div>
			<div className="m-auto pt-2.5 font-medium select-none">
				{title && (
					<h1 className="text-3xl font-medium md:text-5xl">
						{title}
					</h1>
				)}{" "}
				{subtitle && <h2 className={`mt-3 ${smallerSubtitle ? "text-xl" : "text-3xl"} uppercase`}>{subtitle}</h2>}
				{toolbarItems && <Toolbar>{toolbarItems}</Toolbar>}
			</div>
			{children}
			<AppFooter />
		</div>
	)
}
