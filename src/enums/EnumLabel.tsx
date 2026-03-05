export function EnumLabel<E extends number>({
	value,
	labelMap,
	fallback,
	prependText,
	appendText,
	lowercase,
	hidden,
}: {
	value: E | null | undefined
	labelMap: Record<E, string>
	fallback?: string
	prependText?: string
	appendText?: string
	lowercase?: boolean
	hidden?: boolean
}) {
	if (value === null || value === undefined) {
		return fallback
	}

	let valueStr = labelMap[value]

	if (lowercase) {
		valueStr = valueStr.toLowerCase()
	}

	return (
		<span hidden={hidden}>
			{prependText}
			{valueStr}
			{appendText}
		</span>
	)
}
