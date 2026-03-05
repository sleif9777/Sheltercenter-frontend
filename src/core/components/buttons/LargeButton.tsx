export function LargeButton({ onClick, label }: { onClick: () => void; label: string }) {
	return (
		<button
			className="m-auto mt-2.5 block rounded-lg border-2 border-gray-700 bg-gray-100 px-2 py-1 uppercase transition-colors hover:cursor-pointer hover:border-pink-700 hover:bg-pink-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-700 focus:outline-none md:px-5 md:py-2 md:text-xl"
			onClick={onClick}
		>
			{label}
		</button>
	)
}
