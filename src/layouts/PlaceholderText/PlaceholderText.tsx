import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface PlaceholderTextProps {
	iconDef: IconDefinition
	text: string
}

export default function PlaceholderText(props: PlaceholderTextProps) {
	const { iconDef, text } = props

	return (
		<div className="mt-5">
			<div className="block">
				<FontAwesomeIcon icon={iconDef} size="6x" />
			</div>
			<div className="mt-4 text-4xl">{text}</div>
		</div>
	)
}
