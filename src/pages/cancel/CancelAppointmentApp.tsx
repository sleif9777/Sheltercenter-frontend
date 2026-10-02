import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { usePageTitle } from "../../utils/usePageTitle"

type CancelState = "loading" | "confirm" | "success" | "invalid" | "error"

export function CancelAppointmentApp() {
	usePageTitle("Cancel Appointment")
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")
	const [state, setState] = useState<CancelState>("loading")
	const [instantDisplay, setInstantDisplay] = useState("")
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!token) {
			setState("invalid")
			return
		}

		const api = new AppointmentsAPI()
		api.GetByToken(token)
			.then((resp) => {
				if (resp?.status === 200 && resp.data?.instantDisplay) {
					setInstantDisplay(resp.data.instantDisplay)
					setState("confirm")
				} else {
					setState("invalid")
				}
			})
			.catch(() => setState("invalid"))
	}, [token])

	async function handleCancel() {
		if (!token) return
		setSubmitting(true)
		try {
			const resp = await new AppointmentsAPI().CancelByToken(token)
			setState(resp?.status === 200 ? "success" : "error")
		} catch {
			setState("error")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="mb-6 text-center">
				<img
					alt="Saving Grace logo"
					className="m-auto"
					height="192"
					src="https://savinggracenc.org/wp-content/uploads/2017/09/saving-grace-transparentlogo.png"
					width="213"
				/>
				<h1 className="mt-2 text-2xl">Appointment Scheduling Portal</h1>
			</div>

			<div className="w-full max-w-md rounded border border-pink-200 bg-white p-6 shadow-sm lg:max-w-lg">
				{state === "loading" && <p className="text-center text-gray-500">Loading…</p>}

				{state === "confirm" && (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-pink-700">Cancel your appointment</h2>
						<p>
							Are you sure you want to cancel your appointment on{" "}
							<strong>{instantDisplay}</strong>?
						</p>
						<p className="text-sm text-gray-500">
							This will free your slot for another potential adopter. You can schedule a new
							appointment at any time by logging into the portal.
						</p>
						<div className="pt-2">
							<button
								className="rounded bg-pink-700 px-5 py-2 text-white hover:bg-pink-800 disabled:opacity-50"
								disabled={submitting}
								onClick={handleCancel}
							>
								{submitting ? "Cancelling…" : "Yes, cancel my appointment"}
							</button>
						</div>
					</div>
				)}

				{state === "success" && (
					<div className="space-y-3">
						<h2 className="text-xl font-semibold text-pink-700">Appointment cancelled</h2>
						<p>Your appointment has been cancelled. We hope to see you again soon!</p>
						<p>
							<a
								className="text-pink-700 underline"
								href="https://savinggracencscheduler.com"
							>
								Schedule a new appointment
							</a>
						</p>
					</div>
				)}

				{state === "invalid" && (
					<div className="space-y-3">
						<h2 className="text-xl font-semibold text-pink-700">Link unavailable</h2>
						<p>
							This cancellation link is no longer valid. It may have already been used, or
							your appointment may have passed.
						</p>
						<p>
							<a
								className="text-pink-700 underline"
								href="https://savinggracencscheduler.com"
							>
								Visit the scheduling portal
							</a>
						</p>
					</div>
				)}

				{state === "error" && (
					<div className="space-y-3">
						<h2 className="text-xl font-semibold text-pink-700">Something went wrong</h2>
						<p>
							We couldn't process your cancellation. Please try again, or log in to cancel
							manually.
						</p>
						<p>
							<a
								className="text-pink-700 underline"
								href="https://savinggracencscheduler.com"
							>
								Visit the scheduling portal
							</a>
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
