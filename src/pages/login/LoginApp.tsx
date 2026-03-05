import { LoginForm } from "../../forms/users/LoginForm"

export function LoginApp() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
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
			<div className="w-lg border-t border-pink-700 pt-6">
				<LoginForm />
			</div>
		</div>
	)
}
