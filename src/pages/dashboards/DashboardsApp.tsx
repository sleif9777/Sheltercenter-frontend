import { useEffect } from "react"

import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { DashboardMode, useDashboardsState } from "./DashboardsAppState"
import { DashboardDog, DashboardDogHash } from "../../models/DogModels"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { DateTime } from "../../utils/DateTime"

type DashboardDogHashKey = Omit<keyof DashboardDogHash, "chosen"> | keyof DashboardDogHash["chosen"]

const DASHBOARD_MODE_OPTIONS: SelectInputOption<DashboardMode>[] = [
	{ label: "Who Went Home", value: DashboardMode.WHO_WENT_HOME },
	{ label: "Chosen", value: DashboardMode.CHOSEN },
	{ label: "FTA", value: DashboardMode.FTA },
]

const DASHBOARD_MODE_TITLES: Record<DashboardMode, string> = {
	[DashboardMode.WHO_WENT_HOME]: "Who Went Home This Week",
	[DashboardMode.CHOSEN]: "Chosen Dogs",
	[DashboardMode.FTA]: "Foster to Adopt",
}

const DAY_OF_WEEK_COLORS: Record<number, string> = {
	0: "bg-purple-100 border-purple-800 text-purple-800", // Sun (just in case)
	1: "bg-red-100 border-red-800 text-red-800", // Mon
	2: "bg-orange-100 border-orange-800 text-orange-800", // Tue
	3: "bg-yellow-100 border-yellow-800 text-yellow-800", // Wed
	4: "bg-green-100 border-green-800 text-green-800", // Thu
	5: "bg-blue-100 border-blue-800 text-blue-800", // Fri
	6: "bg-purple-100 border-purple-800 text-purple-800", // Sat
}

function getDogCardColor(dog: DashboardDog, key: DashboardDogHashKey, mode: DashboardMode): string {
	if (mode === DashboardMode.WHO_WENT_HOME && key == "newlyInHome" && dog.unavailableDate) {
		const day = new DateTime(dog.unavailableDate).GetWeekday()
		return DAY_OF_WEEK_COLORS[day] ?? "bg-white border-gray-200"
	}

	if (key == "fta" || key == "readyToRoll") {
		return "bg-pink-200 border-pink-700"
	}

	if (key == "needsSN" || key == "needsWC") {
		return "bg-blue-200 border-blue-300"
	}

	return "bg-white border-gray-200"
}

function sortByName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => a.name.localeCompare(b.name))
}

function sortByUnavailableDateThenName(dogs: DashboardDog[]) {
	return [...dogs].sort((a, b) => {
		const dateA = new DateTime(a.unavailableDate ?? "")
		const dateB = new DateTime(b.unavailableDate ?? "")
		if (dateA !== dateB) {
			return dateB.DiffWithDate(dateA) > 0 ? 1 : -1
		}
		return a.name.localeCompare(b.name)
	})
}

export default function DashboardsApp() {
	const { dogHash, isRefreshing, mode, refresh } = useDashboardsState()

	useEffect(() => {
		refresh()

		const interval = setInterval(
			() => {
				refresh()
			},
			10 * 60 * 1000
		)

		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FullWidthPage title={DASHBOARD_MODE_TITLES[mode]}>
			<div className="flex flex-col gap-4">
				<div className="m-auto flex items-center gap-4">
					<RadioInput
						className=""
						columnOverride="columns-3"
						options={DASHBOARD_MODE_OPTIONS}
						value={mode}
						onChange={(v: DashboardMode) => useDashboardsState.setState({ mode: v })}
					/>
					{isRefreshing && <span className="text-sm text-gray-500">Refreshing...</span>}
				</div>

				{mode === DashboardMode.WHO_WENT_HOME && (
					<DashboardSection
						className="columns-7"
						dogs={sortByUnavailableDateThenName(dogHash.newlyInHome)}
						hashKey="newlyInHome"
						mode={mode}
					/>
				)}

				{mode === DashboardMode.CHOSEN && (
					<div className="m-auto flex flex-row gap-4">
						<DashboardSection
							className="columns-2"
							dogs={sortByName(dogHash.chosen.needsSN)}
							hashKey="needsSN"
							mode={mode}
							title="Needs Spay/Neuter"
						/>
						<DashboardSection
							className="columns-2"
							dogs={sortByName(dogHash.chosen.readyToRoll)}
							hashKey="readyToRoll"
							mode={mode}
							title="Ready to Roll"
						/>
						<DashboardSection
							className="columns-2"
							dogs={sortByName(dogHash.chosen.needsWC)}
							hashKey="needsWC"
							mode={mode}
							title="Needs Well Check"
						/>
					</div>
				)}

				{mode === DashboardMode.FTA && (
					<DashboardSection className="columns-7" dogs={sortByName(dogHash.fta)} hashKey="fta" mode={mode} />
				)}
			</div>
		</FullWidthPage>
	)
}

function DashboardSection({
	className,
	hashKey,
	title,
	dogs,
	mode,
}: {
	className?: string
	hashKey: DashboardDogHashKey
	title?: string
	dogs: DashboardDog[]
	mode: DashboardMode
}) {
	return (
		<div className="mx-3 flex flex-col gap-2">
			{title && <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>}
			<h3 className="text-xl font-normal text-gray-700 uppercase">Total: {dogs.length} dogs</h3>
			{dogs.length > 0 && (
				<ul className={className ?? "flex flex-col gap-1"}>
					{dogs.map((dog, i) => (
						<li className={`mb-1 border-2 px-3 py-2 ${getDogCardColor(dog, hashKey, mode)}`} key={i}>
							<div className="flex flex-row items-center gap-2">
								<img className="my-1 ml-1 aspect-square w-14 shrink-0 rounded-full" src={dog.photoURL} />
								<span className="mr-1 text-lg font-medium uppercase">{dog.name}</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
