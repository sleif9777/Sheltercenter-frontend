import { ReactNode } from "react"

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
				<span className="text-3xl md:text-5xl">
					{typeof title == "string" ? <h1 className="font-medium">{title}</h1> : title}
				</span>{" "}
				{subtitle && <h2 className={`mt-3 ${smallerSubtitle ? "text-xl" : "text-3xl"} uppercase`}>{subtitle}</h2>}
				{toolbarItems && <Toolbar>{toolbarItems}</Toolbar>}
			</div>
			{children}
		</div>
	)
}
