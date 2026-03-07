import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { NavigationBar } from "./core/navigation/NavigationBar.tsx"
import { useSessionState } from "./core/session/SessionState.ts"
import AdopterDetailsApp from "./pages/adopter/AdopterDetailsApp.tsx"
import AdopterDirectoryApp from "./pages/adopter/AdopterDirectoryApp.tsx"
import { AdopterLandingPageApp } from "./pages/adopter/AdopterLandingPageApp.tsx"
import { AdopterPreferencesApp } from "./pages/adopter/AdopterPreferencesApp.tsx"
import { AdopterUploadApp } from "./pages/adopter/AdopterUploadApp.tsx"
import { ChosenBoardApp } from "./pages/chosenBoard/ChosenBoardApp.tsx"
import DailyReportApp from "./pages/dailyReport/DailyReportApp.tsx"
import { ErrorApp } from "./pages/error/ErrorApp.tsx"
import InProgressAppointmentsApp from "./pages/inProgressAppts/InProgressAppointmentsApp.tsx"
import { LoginApp } from "./pages/login/LoginApp.tsx"
import PrintViewApp from "./pages/printView/PrintViewApp.tsx"
import { PrivacyPolicyApp } from "./pages/privacy/PrivacyPolicyApp.tsx"
import RecentUploadsApp from "./pages/recentUploads/RecentUploadsApp.tsx"
import { ScheduleApp } from "./pages/schedule/ScheduleApp.tsx"
import TemplateApp from "./pages/template/TemplateApp.tsx"

import "./App.scss"
import "@fontsource-variable/inter/wght-italic.css"
import "@fontsource/lato/300.css"
import "@fontsource/lato/400.css"
import "@fontsource/lato/700.css"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import { WatchlistApp } from "./pages/watchlist/WatchlistApp.tsx"
import { ToastProvider } from "./core/components/messages/ToastProvider.tsx"
import RecentAdoptionsApp from "./pages/recentAdoptions/RecentAdoptionsApp.tsx"
import DashboardsApp from "./pages/dashboards/DashboardsApp.tsx"

const SIDEBAR_STORAGE_KEY = "sidebar_collapsed"

function App() {
	const session = useSessionState()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	// Desktop sidebar collapsed state — persisted to localStorage
	const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
		try {
			const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
			return stored ? JSON.parse(stored) : false
		} catch {
			return false
		}
	})

	const toggleDesktopCollapsed = () => {
		setDesktopCollapsed((prev) => {
			const next = !prev
			try {
				localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next))
			} catch {
				// ignore storage errors
			}
			return next
		})
	}

	useEffect(() => {
		session.validateSession()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<BrowserRouter>
			<div className="flex h-screen w-screen flex-col overflow-hidden md:flex-row">
				{/* Mobile menu button */}
				{session.isAuthenticated && (
					<button
						className="fixed top-4 left-4 z-50 rounded-md bg-pink-700 px-4 py-2 text-white md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? "✕" : "☰"}
					</button>
				)}

				{/* Mobile backdrop */}
				{session.isAuthenticated && mobileMenuOpen && (
					<div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
				)}

				{/* Sidebar */}
				{session.isAuthenticated && (
					<div
						className={`fixed top-0 right-0 z-40 h-full w-64 bg-white transition-all duration-300 md:static md:h-screen md:shrink-0 md:translate-x-0 print:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"} ${desktopCollapsed ? "md:w-14" : "md:w-[15%] md:min-w-32"} `}
					>
						<NavigationBar
							collapsed={desktopCollapsed}
							onNavigate={() => setMobileMenuOpen(false)}
							onToggleCollapse={toggleDesktopCollapsed}
						/>
					</div>
				)}

				{/* Main column */}
				<div className="flex flex-1 flex-col not-print:min-h-screen lg:w-[85%] print:w-full">
					<div className="flex-1 overflow-auto">
						{session.isAuthenticated ? (
							<Routes>
								<Route element={<AdopterLandingPageApp />} index={session.adopterUser} />
								<Route element={<AdopterLandingPageApp />} path="/my_home/" />
								<Route element={<AdopterPreferencesApp />} path="/preferences/" />
								<Route element={<WatchlistApp />} path="/watchlist/" />
								<Route element={<DashboardsApp />} path="/dashboards/" />
								<Route element={<AdopterUploadApp />} path="/adopters/upload/" />
								<Route element={<ChosenBoardApp />} path="/chosen_board/" />
								<Route element={<ScheduleApp />} index={!session.adopterUser} />
								<Route element={<ScheduleApp />} path="/calendar" />
								<Route element={<TemplateApp />} path="/calendar_template/" />
								<Route element={<PrintViewApp />} path="/print_view/:date/" />
								<Route element={<DailyReportApp />} path="/daily_report/:date/" />
								<Route element={<AdopterDirectoryApp />} path="/adopters/directory/" />
								<Route element={<AdopterDetailsApp />} path="/adopters/detail/:id" />
								<Route element={<InProgressAppointmentsApp />} path="/in_progress/" />
								<Route element={<RecentAdoptionsApp />} path="/recent_adoptions/" />
								<Route element={<RecentUploadsApp />} path="/recent_uploads/" />
								<Route element={<PrivacyPolicyApp />} path="/privacy/" />
								<Route element={<ErrorApp />} path="/*/" />
							</Routes>
						) : (
							<LoginApp />
						)}
					</div>
				</div>
			</div>
			<ToastProvider />
		</BrowserRouter>
	)
}

export default App
