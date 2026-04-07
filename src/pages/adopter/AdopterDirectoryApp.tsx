import { faAddressCard, faBan, faHourglassHalf, faSpinner, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useRef, useState } from "react"

import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { CheckboxInput } from "../../core/components/formInputs/CheckboxInput"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { AdopterApprovalStatus } from "../../enums/AdopterEnums"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { DirectoryAdopter } from "../../models/AdopterModels"
import { StringUtils } from "../../utils/StringUtils"

export default function AdopterDirectoryApp() {
	const [adopters, setAdopters] = useState<DirectoryAdopter[]>([])
	const [filterText, setFilterText] = useState<string>("")
	const [includeArchived, setIncludeArchived] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [hasSearched, setHasSearched] = useState<boolean>(false)
	const abortControllerRef = useRef<AbortController | null>(null)
	const isLoadingRef = useRef<boolean>(false)

	const fetchNewResult = useCallback(async (filterText: string, archived: boolean) => {
		if (filterText.length < 3) {
			setAdopters([])
			return
		}

		if (isLoadingRef.current) return

		isLoadingRef.current = true

		abortControllerRef.current?.abort()
		abortControllerRef.current = new AbortController()

		const loadingTimer = window.setTimeout(() => {
			setLoading(true)
		}, 50)

		try {
			const response = await new AdoptersAPI().GetAdopterDirectoryListing(filterText.toLowerCase(), archived)
			setAdopters(response.adopters)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			if (e?.name !== "AbortError") throw e
		} finally {
			isLoadingRef.current = false
			clearTimeout(loadingTimer)
			setLoading(false)
		}
	}, [])

	const handleArchivedChange = useCallback(
		(checked: boolean) => {
			setIncludeArchived(checked)
			fetchNewResult(filterText, checked)
		},
		[fetchNewResult, filterText]
	)

	return (
		<FullWidthPage title="Manage Adopters">
			<div className="mx-5 mt-3 border-t border-pink-700 py-2">
				<div className="m-auto flex w-xs flex-col gap-y-1 sm:w-sm">
					<TextInput
						addlProps={{
							autoComplete: "off",
							onKeyDown: (e: React.KeyboardEvent) => {
								if (e.key === "Enter" && !isLoadingRef.current) {
									setHasSearched(true)
									fetchNewResult(filterText, includeArchived)
								}
							},
							placeholder: "Search by name or email...",
						}}
						defaultDirty
						errors={filterText.length >= 3 ? ["Press Enter to search."] : undefined}
						fieldLabel="Filter Adopters"
						value={filterText}
						onChange={(e) => {
							setFilterText(e)
							setHasSearched(false)
						}}
					/>
					<CheckboxInput
						addlProps={{
							disabled: filterText.length < 3,
						}}
						fieldLabel="Include Archived"
						helpText="Include adopters without an upload, booking, or login in the past 90 days"
						value={includeArchived}
						onChange={handleArchivedChange}
					/>
				</div>
			</div>
			{loading && (
				<div>
					<PlaceholderText iconDef={faSpinner} text="Loading adopters..." />
				</div>
			)}
			{!loading && (
				<div className="mx-3">
					{adopters.length > 0 && <AdopterDirectoryListing adopters={adopters} />}
					{adopters.length === 0 && (
						<PlaceholderText
							iconDef={faAddressCard}
							text={filterText.length < 3 ? "Enter a search term (name or email) to find an adopter." : "No results found."}
						/>
					)}
				</div>
			)}
		</FullWidthPage>
	)
}

function AdopterDirectoryListing({ adopters }: { adopters: DirectoryAdopter[] }) {
	return (
		<ul className="columns-3 gap-2 md:columns-4">
			{adopters.map((adopter) => (
				<li key={adopter.ID}>
					<LinkToAdopterPage adopter={adopter} />
				</li>
			))}
		</ul>
	)
}

function LinkToAdopterPage({ adopter }: { adopter: DirectoryAdopter }) {
	return (
		<div className="break-inside-avoid-column rounded-md border-2 border-pink-800 bg-pink-100 py-px text-left wrap-normal text-pink-800 hover:bg-pink-300 hover:text-pink-900">
			<a href={`/adopters/detail/${adopter.ID}`} target="_blank">
				<div className="mx-1 border-b border-pink-800 pb-px text-lg font-semibold uppercase">
					{adopter.fullName} <AdopterStatusIcon adopter={adopter} />
				</div>
				<div className="mx-1 pt-px text-[10px]">{adopter.primaryEmail}</div>
			</a>
		</div>
	)
}

function AdopterStatusIcon({ adopter }: { adopter: DirectoryAdopter }) {
	let icon: IconDefinition | undefined,
		tooltip: string = ""
	switch (adopter.status) {
		case AdopterApprovalStatus.PENDING:
			icon = faHourglassHalf
			tooltip = "Pending Approval"
			break
		case AdopterApprovalStatus.DENIED:
			icon = faBan
			tooltip = "Application Denied"
	}

	if (!icon || StringUtils.isNull(tooltip)) {
		return
	}

	return (
		icon && (
			<TooltipProvider tooltip={tooltip}>
				<FontAwesomeIcon icon={icon} />
			</TooltipProvider>
		)
	)
}
