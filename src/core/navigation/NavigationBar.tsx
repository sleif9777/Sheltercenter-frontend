import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ReactNode, useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import Logo from "../../assets/logo.png"
import { useSessionState } from "../session/SessionState"
import { TooltipProvider } from "../components/messages/TooltipProvider"
import React from "react"

export function NavigationBar({ debug, onNavigate }: { debug?: boolean; onNavigate?: () => void }) {
	const session = useSessionState()

	return (
		<div className="z-10 h-screen w-full overflow-y-auto border-r border-gray-200">
			<a className="flex w-full justify-center" href="https://savinggracenc.org/">
				<img alt="Saving Grace logo" className="pb-4" src={Logo} />
			</a>

			<div className="flex flex-col">
				{session.adopterUser && (
					<>
						<AdopterLandingPageButton onNavigate={onNavigate} />
						<ScheduleButton onNavigate={onNavigate} />
						<WatchlistButton onNavigate={onNavigate} />
						<AdopterPreferencesButton onNavigate={onNavigate} />
					</>
				)}
				{session.greeterUser && (
					<>
						<ScheduleButton onNavigate={onNavigate} />
						<InProgressAppointmentsButton onNavigate={onNavigate} />
					</>
				)}
				{session.adminUser && (
					<>
						<NavigationSection caption="Scheduling">
							<ScheduleButton onNavigate={onNavigate} />
							<WeeklyTemplateButton onNavigate={onNavigate} />
							<InProgressAppointmentsButton onNavigate={onNavigate} />
						</NavigationSection>
						<NavigationSection caption="Adoptions">
							<ChosenBoardButton onNavigate={onNavigate} />
							<RecentAdoptionsButton onNavigate={onNavigate} />
						</NavigationSection>
						<NavigationSection caption="Adopters">
							<AdopterDirectoryButton onNavigate={onNavigate} />
							<UploadAdoptersButton onNavigate={onNavigate} />
							<RecentUploadsButton onNavigate={onNavigate} />
						</NavigationSection>
						<NavigationSection caption="Dogs">
							<WatchlistButton onNavigate={onNavigate} />
						</NavigationSection>
					</>
				)}
				<PrivacyPolicyButton onNavigate={onNavigate} />
				<SignOutButton onNavigate={onNavigate} />
			</div>
			{debug && (
				<div>
					<pre>{JSON.stringify(session, null, 2)}</pre>
				</div>
			)}
		</div>
	)
}

function NavigationSection({ caption, children }: { caption: string; children: ReactNode }) {
	const [open, setOpen] = useState(false)

	return (
		<div className="w-full border-b border-pink-700">
			<button
				className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-2xl font-medium text-pink-700 uppercase transition-colors outline-none hover:bg-pink-200 md:text-sm lg:text-lg xl:text-xl"
				onClick={() => setOpen((v) => !v)}
			>
				<span>{caption}</span>
				<FontAwesomeIcon className="text-sm" icon={open ? faChevronUp : faChevronDown} />
			</button>
			{open && (
				<div className="flex flex-col bg-pink-50">
					{React.Children.map(children, (child) =>
						React.isValidElement(child) ? React.cloneElement(child as React.ReactElement, { noBorder: true }) : child
					)}
				</div>
			)}
		</div>
	)
}

function NavigationButton({
	caption,
	disabled,
	isLast,
	noBorder,
	onClick,
	route,
	onNavigate,
}: {
	caption: string
	disabled?: boolean
	isLast?: boolean
	noBorder?: boolean
	onClick?: () => void
	route?: string
	onNavigate?: () => void
}) {
	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (onClick) {
				e.preventDefault()
				onClick()
			}
			onNavigate?.()
		},
		[onClick, onNavigate]
	)

	return (
		<TooltipProvider tooltip={disabled ? "Calendar restricted after choosing a dog." : ""}>
			<div className={`w-full ${!isLast && !noBorder ? "border-b border-pink-700" : ""}`}>
				<Link
					className={`block px-4 py-3 text-center text-2xl font-medium uppercase transition-colors md:text-sm lg:text-lg xl:text-xl ${
						disabled
							? "pointer-events-none cursor-not-allowed text-gray-400"
							: "cursor-pointer text-pink-700 hover:bg-pink-200"
					}`}
					to={route ?? "#"}
					onClick={handleClick}
				>
					<span className="button-text">{caption}</span>
				</Link>
			</div>
		</TooltipProvider>
	)
}

interface NavigationButtonProps {
	noBorder?: boolean
	onNavigate?: () => void
}

function AdopterLandingPageButton({ onNavigate }: NavigationButtonProps) {
	return <NavigationButton caption="Home" route="/my_home/" onNavigate={onNavigate} />
}

function ScheduleButton({ noBorder, onNavigate }: NavigationButtonProps) {
	const session = useSessionState()

	return (
		<NavigationButton
			caption={session.adopterUser ? "Book Appointment" : "Calendar"}
			disabled={session.user?.restrictCalendar}
			noBorder={noBorder}
			route="/calendar/"
			onNavigate={onNavigate}
		/>
	)
}

function WatchlistButton({ noBorder, onNavigate }: NavigationButtonProps) {
	const session = useSessionState()
	return (
		<NavigationButton
			caption={session.adopterUser ? "My Dog Watchlist" : "Available Dogs"}
			noBorder={noBorder}
			route="/watchlist/"
			onNavigate={onNavigate}
		/>
	)
}

function AdopterPreferencesButton({ onNavigate }: NavigationButtonProps) {
	return <NavigationButton caption="My Preferences" route="/preferences/" onNavigate={onNavigate} />
}

function WeeklyTemplateButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="Weekly Template" noBorder={noBorder} route="/calendar_template/" onNavigate={onNavigate} />
	)
}

function UploadAdoptersButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="Upload Adopters" noBorder={noBorder} route="/adopters/upload/" onNavigate={onNavigate} />
	)
}

function AdopterDirectoryButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Adopter Directory"
			noBorder={noBorder}
			route="/adopters/directory/"
			onNavigate={onNavigate}
		/>
	)
}

function ChosenBoardButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return <NavigationButton caption="Chosen Board" noBorder={noBorder} route="/chosen_board/" onNavigate={onNavigate} />
}

function InProgressAppointmentsButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="In Progress Appts" noBorder={noBorder} route="/in_progress/" onNavigate={onNavigate} />
	)
}

function PrivacyPolicyButton({ onNavigate }: NavigationButtonProps) {
	return <NavigationButton caption="Privacy Policy" route="/privacy/" onNavigate={onNavigate} />
}

function RecentUploadsButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="Recent Uploads" noBorder={noBorder} route="/recent_uploads/" onNavigate={onNavigate} />
	)
}

function RecentAdoptionsButton({ noBorder, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="Recent Adoptions" noBorder={noBorder} route="/recent_adoptions/" onNavigate={onNavigate} />
	)
}

function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
	const session = useSessionState()
	const navigate = useNavigate()

	const handleClick = useCallback(() => {
		session.logOut()
		navigate("/")
	}, [session, navigate])

	return <NavigationButton caption="Sign Out" isLast onClick={handleClick} onNavigate={onNavigate} />
}
