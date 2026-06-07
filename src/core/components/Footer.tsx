export function AppFooter() {
	return (
		<footer className="border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-400 print:hidden">
			Icons by{" "}
			<a
				className="underline hover:text-gray-600"
				href="https://fontawesome.com"
				rel="noreferrer"
				target="_blank"
			>
				Font Awesome
			</a>{" "}
			(CC BY 4.0). Fonts:{" "}
			<a
				className="underline hover:text-gray-600"
				href="https://rsms.me/inter/"
				rel="noreferrer"
				target="_blank"
			>
				Inter
			</a>
			,{" "}
			<a
				className="underline hover:text-gray-600"
				href="https://fonts.google.com/specimen/Lato"
				rel="noreferrer"
				target="_blank"
			>
				Lato
			</a>
			,{" "}
			<a
				className="underline hover:text-gray-600"
				href="https://fonts.google.com/specimen/Roboto"
				rel="noreferrer"
				target="_blank"
			>
				Roboto
			</a>{" "}
			(OFL 1.1). ·{" "}
			<a className="underline hover:text-gray-600" href="/privacy/">
				Privacy Policy
			</a>
		</footer>
	)
}
