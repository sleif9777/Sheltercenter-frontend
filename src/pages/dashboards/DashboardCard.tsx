import { ReactNode } from "react"

// One row on a dashboard list: the dog's photo, then whatever the list shows about it.
export function DashboardCard({ children, className, photoURL }: { children: ReactNode; className: string; photoURL: string }) {
	return (
		<li className={`mb-1 break-inside-avoid border-2 px-3 py-2 ${className}`}>
			<div className="flex flex-row items-center gap-2">
				<img className="my-1 ml-1 aspect-square w-14 shrink-0 rounded-full" src={photoURL} />
				{children}
			</div>
		</li>
	)
}
