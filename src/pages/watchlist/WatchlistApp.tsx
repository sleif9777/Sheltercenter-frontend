import { useCallback, useEffect, useState } from "react"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { useWatchlistState } from "./WatchlistAppState"
import { Modal, ModalState, useModalState } from "../../core/components/modal/Modal"
import { ToolbarModal } from "../../layouts/Toolbar/Toolbar"
import { useSessionState } from "../../core/session/SessionState"
import { WatchlistHelpForm } from "../../forms/watchlist/WatchlistHelpForm"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { DogCard } from "../../cards/appointments/DogCard"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { WatchlistSortMethod, WatchlistSortMethodLabel } from "../../enums/DogEnums"
import { HashDog } from "../../models/DogModels"

export function WatchlistApp() {
	const watchlist = useWatchlistState(),
		session = useSessionState()
	const helpModalState = useModalState()
	const [sortMethod, setSortMethod] = useState<WatchlistSortMethod>(WatchlistSortMethod.NAME_ASC)

	const sortOptions = [
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.NAME_ASC], value: WatchlistSortMethod.NAME_ASC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.NAME_DESC], value: WatchlistSortMethod.NAME_DESC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.AGE_ASC], value: WatchlistSortMethod.AGE_ASC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.AGE_DESC], value: WatchlistSortMethod.AGE_DESC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.SIZE_ASC], value: WatchlistSortMethod.SIZE_ASC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.SIZE_DESC], value: WatchlistSortMethod.SIZE_DESC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.POP_ASC], value: WatchlistSortMethod.POP_ASC },
		{ label: WatchlistSortMethodLabel[WatchlistSortMethod.POP_DESC], value: WatchlistSortMethod.POP_DESC },
	]

	const sortDogs = useCallback(
		(a: HashDog, b: HashDog) => {
			const tiebreak = a.name.localeCompare(b.name)
			switch (sortMethod) {
				case WatchlistSortMethod.NAME_ASC:
					return a.name.localeCompare(b.name)
				case WatchlistSortMethod.NAME_DESC:
					return b.name.localeCompare(a.name)
				case WatchlistSortMethod.AGE_ASC:
					return a.ageMonths !== b.ageMonths ? (a.ageMonths < b.ageMonths ? -1 : 1) : tiebreak
				case WatchlistSortMethod.AGE_DESC:
					return a.ageMonths !== b.ageMonths ? (a.ageMonths < b.ageMonths ? 1 : -1) : tiebreak
				case WatchlistSortMethod.SIZE_ASC:
					return a.weight !== b.weight ? (a.weight < b.weight ? -1 : 1) : tiebreak
				case WatchlistSortMethod.SIZE_DESC:
					return a.weight !== b.weight ? (a.weight < b.weight ? 1 : -1) : tiebreak
				case WatchlistSortMethod.POP_ASC:
					return a.interestCount !== b.interestCount ? (a.interestCount < b.interestCount ? 1 : -1) : tiebreak
				case WatchlistSortMethod.POP_DESC:
					return a.interestCount !== b.interestCount ? (a.interestCount < b.interestCount ? -1 : 1) : tiebreak
				default:
					return tiebreak
			}
		},
		[sortMethod]
	)

	useEffect(() => {
		watchlist.refresh()

		if (!session.acknowledgements.watchlist) {
			helpModalState.open()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FullWidthPage
			smallerSubtitle
			subtitle={"Last Update: " + watchlist.lastImport.GetFullDateTime()}
			title={session.adminUser ? "Available Dogs" : "Watchlist"}
			toolbarItems={session.adminUser ? [] : [<HelpModal modalState={helpModalState} />]}
		>
			<div className="mx-5 flex flex-1 flex-col-reverse items-stretch gap-x-4 border-t border-pink-800 py-2 lg:flex-row">
				<StandardCard
					className={"rounded-lg py-2 " + (session.adopterUser ? "lg:w-[50%]" : "w-full")}
					color={CardColor.BLUE}
					description="Available Dogs"
					hideTitleBorder
					whiteBg
				>
					<RadioInput
						className="mb-2"
						columnOverride="columns-2 md:columns-4"
						fieldLabel="Sort"
						options={sortOptions}
						value={sortMethod}
						onChange={(v: WatchlistSortMethod) => setSortMethod(v)}
					/>
					<ul className={session.adopterUser ? "" : "mt-2 columns-1 lg:columns-2"}>
						{watchlist.dogHash?.notWatching.sort(sortDogs).map((dog, i) => (
							<li key={i}>
								<DogCard dogID={dog.ID} inWatchlist={false} />
							</li>
						))}
					</ul>
				</StandardCard>
				{session.adopterUser && (
					<StandardCard
						className="rounded-lg py-2 lg:w-[50%]"
						color={CardColor.PINK}
						description="My Watchlist"
						hideTitleBorder
						whiteBg
					>
						<h3 className="mb-2 text-left text-lg font-semibold uppercase underline">Still Available</h3>
						<ul>
							{watchlist.dogHash?.watching.available
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((dog, i) => (
									<li key={i}>
										<DogCard dogID={dog.ID} inWatchlist />
									</li>
								))}
						</ul>
						<h3 className="mb-2 text-left text-lg font-semibold uppercase underline">No Longer Available</h3>
						<ul>
							{watchlist.dogHash?.watching.notAvailable
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((dog, i) => (
									<li key={i}>
										<DogCard dogID={dog.ID} inWatchlist />
									</li>
								))}
						</ul>
					</StandardCard>
				)}
			</div>
		</FullWidthPage>
	)
}

function HelpModal({ modalState }: { modalState: ModalState }) {
	const session = useSessionState()

	return (
		<ToolbarModal
			modal={
				<Modal
					modalState={modalState}
					modalTitle="Watchlist Help"
					preventCloseBeforeComplete={!session.acknowledgements.watchlist}
				>
					<WatchlistHelpForm modalState={modalState} />
				</Modal>
			}
			text="Help"
		/>
	)
}
