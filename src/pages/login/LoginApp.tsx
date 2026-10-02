import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { UsersAPI } from "../../api/users/UsersAPI"
import { MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { useSessionState } from "../../core/session/SessionState"
import { LoginForm } from "../../forms/users/LoginForm"
import { usePageTitle } from "../../utils/usePageTitle"

export function LoginApp() {
	usePageTitle("Log In")
	const [searchParams] = useSearchParams()
	const emailParam = searchParams.get("email")
	const session = useSessionState()
	const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)

	useEffect(() => {
		if (!emailParam) return

		new UsersAPI().LogIn({ primaryEmail: emailParam }).then((resp) => {
			if (resp.status === 202) {
				session.setUpSession(resp.data)
			} else if (resp.status === 418) {
				showToast({
					level: MessageLevel.Warning,
					message: "Your application is expired. Redirecting you to a new application...",
				})
				setTimeout(() => {
					window.open("https://www.shelterluv.com/matchme/adopt/SGNC/Dog", "_blank")
				}, 1500)
			}
			setAutoLoginAttempted(true)
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (emailParam && !autoLoginAttempted) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center px-4">
				<p className="text-gray-500">Signing you in…</p>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="mb-4 block">
				<img
					alt="Saving Grace logo"
					className="m-auto"
					height="192"
					src="https://savinggracenc.org/wp-content/uploads/2017/09/saving-grace-transparentlogo.png"
					width="213"
				/>
				<h1 className="mt-2 text-2xl">Appointment Scheduling Portal</h1>
			</div>
			<div className="w-full max-w-md border-t border-pink-700 pt-6 lg:max-w-lg">
				<LoginForm />
			</div>
		</div>
	)
}
