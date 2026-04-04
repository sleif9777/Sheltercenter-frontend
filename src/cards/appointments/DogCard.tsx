import { useCallback, useEffect, useState } from "react"
import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"

import { DogsAPI } from "../../api/dogs/DogsAPI"
import { IDog } from "../../models/DogModels"
import { DogSex, DogSexLabel } from "../../enums/DogEnums"
import { DateTime } from "../../utils/DateTime"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { faDog, faHeart, faHeartCircleMinus, faHeartCirclePlus } from "@fortawesome/free-solid-svg-icons"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { useSessionState } from "../../core/session/SessionState"
import { useWatchlistState } from "../../pages/watchlist/WatchlistAppState"

export function DogCard({ dogID, inWatchlist }: { dogID: number; inWatchlist: boolean }) {
	const session = useSessionState()
	const [dog, setDog] = useState<IDog>()

	const fetchData = useCallback(async () => {
		const resp = await new DogsAPI().GetDogDemographics(dogID)
		setDog(resp.dog)
	}, [dogID])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	if (!dog) {
		return
	}

	const dogCardColor = dog.availableNow ? (dog.sex == DogSex.FEMALE ? CardColor.PINK : CardColor.BLUE) : CardColor.GRAY

	return (
		<StandardCard
			color={dogCardColor}
			description={
				<>
					<TooltipProvider tooltip={session.adminUser ? `ID: ${dog.ID}` : ""}>
						<span>{dog.name}</span>
					</TooltipProvider>
					{dog.availableNow && (
						<span className="ml-2">
							(
							<TooltipProvider
								tooltip={`${dog.interestCount} ${dog.interestCount == 1 ? "adopter" : "adopters"} interested in ${dog.name}`}
							>
								<span className="mx-1">
									<FontAwesomeIcon icon={faHeart} /> {dog.interestCount}
								</span>
							</TooltipProvider>
							)
						</span>
					)}
				</>
			}
		>
			{/* Adopters see alerts as full-width/above picture due to extra buttons */}
			{session.adopterUser && <DogInfo className="" dog={dog} />}
			<div className="my-2 flex flex-row gap-x-1">
				<div>
					<img
						className={`m-auto aspect-square max-w-40 rounded-full ` + (!dog.availableNow ? "grayscale" : "")}
						src={dog.photoURL}
					/>
				</div>
				{session.adopterUser ? (
					<div className="m-auto flex flex-col gap-y-3">
						{dog.availableNow && <ReadBioButton dog={dog} />}
						{inWatchlist ? <RemoveDogButton dog={dog} /> : <AddDogButton dog={dog} />}
					</div>
				) : (
					<DogInfo className="m-auto mx-2" dog={dog} /> // Admins see this in place of the buttons
				)}
			</div>
		</StandardCard>
	)
}

function DogInfo({ className, dog }: { className: string; dog: IDog }) {
	return (
		<div className={className}>
			<Message
				icon={faDog}
				level={MessageLevel.Default}
				message={
					<>
						<div>
							{DogSexLabel[dog.sex]} | {dog.breed} | {dog.weight ?? "??"} lbs. | Estimated age {Math.trunc(dog.ageMonths / 12)}{" "}
							y, {dog.ageMonths % 12} mo
						</div>
					</>
				}
			/>
			{!!dog.funSize && dog.availableNow && (
				<div>
					<Message level={MessageLevel.Warning} message="Fun Size! Schedule for Friday or Saturday" />
				</div>
			)}
			{!!dog.availableDate && dog.availableNow && (
				<div>
					<Message
						level={MessageLevel.Warning}
						message={`Available on and after ${new DateTime(dog.availableDate).GetMonthDay()}!`}
					/>
				</div>
			)}
		</div>
	)
}

function ReadBioButton({ dog }: { dog: IDog }) {
	const modalState = useModalState()

	return (
		<>
			<Modal modalState={modalState} modalTitle={"About " + dog.name}>
				<div className="flex flex-row gap-x-2">
					<img
						className="m-auto aspect-square max-h-50 w-[50%] max-w-50 rounded-3xl border-4 border-pink-700 shadow-2xl shadow-pink-200"
						src={dog.photoURL}
					/>
					<div className="my-2 overflow-y-scroll rounded-2xl border-4 border-blue-900 bg-blue-100 p-3 shadow-md shadow-blue-200">
						<span className="whitespace-pre-wrap">{dog.description}</span>
					</div>
				</div>
			</Modal>
			<TooltipProvider tooltip={dog.description.length == 0 ? "No bio yet, check back soon!" : ""}>
				<button
					className="m-auto block rounded-lg border-2 border-gray-700 bg-gray-100 px-5 py-1 text-[16px] uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-100 disabled:hover:border-gray-700"
					disabled={dog.description.length == 0}
					onClick={modalState.open}
				>
					Read Bio
				</button>
			</TooltipProvider>
		</>
	)
}

function AddDogButton({ dog }: { dog: IDog }) {
	const session = useSessionState(),
		watchlist = useWatchlistState()
	const handleClick = useCallback(async () => {
		if (!session.user?.adopterID) {
			return
		}

		await new DogsAPI().AddDogToList(session.user?.adopterID, dog.ID)
		watchlist.refresh()
	}, [dog.ID, session.user?.adopterID, watchlist])

	return (
		<button
			className="m-auto block rounded-lg border-2 border-gray-700 bg-gray-100 px-5 py-1 text-[16px] uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-100 disabled:hover:border-gray-700"
			onClick={handleClick}
		>
			<FontAwesomeIcon className="mr-1" icon={faHeartCirclePlus} /> Add to List
		</button>
	)
}

function RemoveDogButton({ dog }: { dog: IDog }) {
	const session = useSessionState(),
		watchlist = useWatchlistState()
	const handleClick = useCallback(async () => {
		if (!session.user?.adopterID) {
			return
		}

		await new DogsAPI().RemoveDogFromList(session.user?.adopterID, dog.ID)
		watchlist.refresh()
	}, [dog.ID, session.user?.adopterID, watchlist])

	return (
		<button
			className="m-auto block rounded-lg border-2 border-gray-700 bg-gray-100 px-5 py-1 text-[16px] uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-100 disabled:hover:border-gray-700"
			disabled={dog.description.length == 0}
			onClick={handleClick}
		>
			<FontAwesomeIcon className="mr-1" icon={faHeartCircleMinus} /> Remove from List
		</button>
	)
}
