import {
	faCalendar,
	faCalendarWeek,
	faChevronDown,
	faChevronLeft,
	faChevronRight,
	faChevronUp,
	faClipboardList,
	faDashboard,
	faEye,
	faFileUpload,
	faHeart,
	faHome,
	faList,
	faLock,
	faSignOutAlt,
	faStar,
	faUpload,
	faUsers,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { ReactNode, useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import Logo from "../../assets/logo.png"
import { useSessionState } from "../session/SessionState"
import { TooltipProvider } from "../components/messages/TooltipProvider"
import React from "react"

interface NavigationBarProps {
	debug?: boolean
	onNavigate?: () => void
	/** Desktop-only: whether the sidebar is collapsed to icon-only mode */
	collapsed?: boolean
	/** Desktop-only: callback to toggle collapsed state */
	onToggleCollapse?: () => void
}

export function NavigationBar({ debug, onNavigate, collapsed = false, onToggleCollapse }: NavigationBarProps) {
	const session = useSessionState()

	return (
		// Outer wrapper: flex column, no overflow — allows toggle button to escape the edge
		<div className="relative z-10 flex h-screen w-full flex-col border-r border-gray-200">
			{/* Desktop collapse toggle — anchored to outer wrapper, never clipped by scroll */}
			{onToggleCollapse && (
				<button
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					className="absolute top-3 -right-3 z-20 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-pink-700 shadow-sm transition-colors hover:bg-pink-50 md:flex"
					title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					onClick={onToggleCollapse}
				>
					<FontAwesomeIcon className="text-xs" icon={collapsed ? faChevronRight : faChevronLeft} />
				</button>
			)}

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto">
				{/* Logo — swap to heart icon when collapsed */}
				<a className="flex w-full justify-center" href="https://savinggracenc.org/">
					<img alt="Saving Grace logo" className="pb-4" src={Logo} />
				</a>

				<div className="flex flex-col">
					{session.adopterUser && (
						<>
							<AdopterLandingPageButton collapsed={collapsed} onNavigate={onNavigate} />
							<ScheduleButton collapsed={collapsed} onNavigate={onNavigate} />
							<WatchlistButton collapsed={collapsed} onNavigate={onNavigate} />
							<AdopterPreferencesButton collapsed={collapsed} onNavigate={onNavigate} />
						</>
					)}
					{session.greeterUser && (
						<>
							<ScheduleButton collapsed={collapsed} onNavigate={onNavigate} />
							<InProgressAppointmentsButton collapsed={collapsed} onNavigate={onNavigate} />
						</>
					)}
					{session.adminUser && (
						<>
							<NavigationSection caption="Scheduling" collapsed={collapsed}>
								<ScheduleButton collapsed={collapsed} onNavigate={onNavigate} />
								<WeeklyTemplateButton collapsed={collapsed} onNavigate={onNavigate} />
								<InProgressAppointmentsButton collapsed={collapsed} onNavigate={onNavigate} />
							</NavigationSection>
							<NavigationSection caption="Adoptions" collapsed={collapsed}>
								<ChosenBoardButton collapsed={collapsed} onNavigate={onNavigate} />
								<RecentAdoptionsButton collapsed={collapsed} onNavigate={onNavigate} />
							</NavigationSection>
							<NavigationSection caption="Adopters" collapsed={collapsed}>
								<AdopterDirectoryButton collapsed={collapsed} onNavigate={onNavigate} />
								<UploadAdoptersButton collapsed={collapsed} onNavigate={onNavigate} />
								<RecentUploadsButton collapsed={collapsed} onNavigate={onNavigate} />
							</NavigationSection>
							<NavigationSection caption="Dogs" collapsed={collapsed}>
								<WatchlistButton collapsed={collapsed} onNavigate={onNavigate} />
								<DashboardsButton collapsed={collapsed} onNavigate={onNavigate} />
							</NavigationSection>
						</>
					)}
					<PrivacyPolicyButton collapsed={collapsed} onNavigate={onNavigate} />
					<SignOutButton collapsed={collapsed} onNavigate={onNavigate} />
				</div>

				{debug && (
					<div>
						<pre>{JSON.stringify(session, null, 2)}</pre>
					</div>
				)}
			</div>
		</div>
	)
}

function NavigationSection({
	caption,
	children,
	collapsed,
}: {
	caption: string
	children: ReactNode
	collapsed?: boolean
}) {
	const [open, setOpen] = useState(false)

	// When collapsed on desktop, render children as flat icon buttons (no section header)
	if (collapsed) {
		return (
			<div className="hidden w-full flex-col md:flex">
				{React.Children.map(children, (child) =>
					React.isValidElement(child)
						? React.cloneElement(child as React.ReactElement, { collapsed: true, noBorder: true })
						: child
				)}
			</div>
		)
	}

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
	icon,
	isLast,
	noBorder,
	onClick,
	route,
	onNavigate,
	collapsed,
}: {
	caption: string
	disabled?: boolean
	icon: IconDefinition
	isLast?: boolean
	noBorder?: boolean
	onClick?: () => void
	route?: string
	onNavigate?: () => void
	collapsed?: boolean
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

	const disabledTooltip = disabled ? "Calendar restricted after choosing a dog." : ""

	// Collapsed: icon only, desktop only
	if (collapsed) {
		return (
			<TooltipProvider tooltip={disabledTooltip || caption}>
				<div className="hidden w-full md:block">
					<Link
						aria-label={caption}
						className={`flex items-center justify-center py-3 transition-colors ${
							disabled
								? "pointer-events-none cursor-not-allowed text-gray-400"
								: "cursor-pointer text-pink-700 hover:bg-pink-200"
						}`}
						to={route ?? "#"}
						onClick={handleClick}
					>
						<FontAwesomeIcon className="text-lg" icon={icon} />
					</Link>
				</div>
			</TooltipProvider>
		)
	}

	// Expanded: text only, no icon (matches original design)
	return (
		<TooltipProvider tooltip={disabledTooltip}>
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
	collapsed?: boolean
}

function AdopterLandingPageButton({ collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton caption="Home" collapsed={collapsed} icon={faHome} route="/my_home/" onNavigate={onNavigate} />
	)
}

function ScheduleButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	const session = useSessionState()
	return (
		<NavigationButton
			caption={session.adopterUser ? "Book Appointment" : "Calendar"}
			collapsed={collapsed}
			disabled={session.user?.restrictCalendar}
			icon={faCalendar}
			noBorder={noBorder}
			route="/calendar/"
			onNavigate={onNavigate}
		/>
	)
}

function WatchlistButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	const session = useSessionState()
	return (
		<NavigationButton
			caption={session.adopterUser ? "My Dog Watchlist" : "Available Dogs"}
			collapsed={collapsed}
			icon={faEye}
			noBorder={noBorder}
			route="/watchlist/"
			onNavigate={onNavigate}
		/>
	)
}

function DashboardsButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Dashboards"
			collapsed={collapsed}
			icon={faDashboard}
			noBorder={noBorder}
			route="/dashboards/"
			onNavigate={onNavigate}
		/>
	)
}

function AdopterPreferencesButton({ collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="My Preferences"
			collapsed={collapsed}
			icon={faStar}
			route="/preferences/"
			onNavigate={onNavigate}
		/>
	)
}

function WeeklyTemplateButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Weekly Template"
			collapsed={collapsed}
			icon={faCalendarWeek}
			noBorder={noBorder}
			route="/calendar_template/"
			onNavigate={onNavigate}
		/>
	)
}

function UploadAdoptersButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Upload Adopters"
			collapsed={collapsed}
			icon={faUpload}
			noBorder={noBorder}
			route="/adopters/upload/"
			onNavigate={onNavigate}
		/>
	)
}

function AdopterDirectoryButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Adopter Directory"
			collapsed={collapsed}
			icon={faUsers}
			noBorder={noBorder}
			route="/adopters/directory/"
			onNavigate={onNavigate}
		/>
	)
}

function ChosenBoardButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Chosen Board"
			collapsed={collapsed}
			icon={faClipboardList}
			noBorder={noBorder}
			route="/chosen_board/"
			onNavigate={onNavigate}
		/>
	)
}

function InProgressAppointmentsButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="In Progress Appts"
			collapsed={collapsed}
			icon={faList}
			noBorder={noBorder}
			route="/in_progress/"
			onNavigate={onNavigate}
		/>
	)
}

function PrivacyPolicyButton({ collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Privacy Policy"
			collapsed={collapsed}
			icon={faLock}
			route="/privacy/"
			onNavigate={onNavigate}
		/>
	)
}

function RecentUploadsButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Recent Uploads"
			collapsed={collapsed}
			icon={faFileUpload}
			noBorder={noBorder}
			route="/recent_uploads/"
			onNavigate={onNavigate}
		/>
	)
}

function RecentAdoptionsButton({ noBorder, collapsed, onNavigate }: NavigationButtonProps) {
	return (
		<NavigationButton
			caption="Recent Adoptions"
			collapsed={collapsed}
			icon={faHeart}
			noBorder={noBorder}
			route="/recent_adoptions/"
			onNavigate={onNavigate}
		/>
	)
}

function SignOutButton({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
	const session = useSessionState()
	const navigate = useNavigate()

	const handleClick = useCallback(() => {
		session.logOut()
		navigate("/")
	}, [session, navigate])

	return (
		<NavigationButton
			caption="Sign Out"
			collapsed={collapsed}
			icon={faSignOutAlt}
			isLast
			onClick={handleClick}
			onNavigate={onNavigate}
		/>
	)
}
