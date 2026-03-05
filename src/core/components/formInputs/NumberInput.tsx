import { useId, useState } from "react"

import { NumberInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

export function NumberInput({
	errors,
	fieldLabel,
	value,
	onChange,
	showRecommended,
	showRequired,
	addlProps,
}: NumberInputProps) {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(false)

	return (
		<div className="flex flex-col gap-y-1">
			<InputLabel
				elemID={elemID}
				errors={errors}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={showRecommended && value < 1}
				showRequired={!dirty && showRequired && value < 1}
			/>
			<input
				className="rounded-sm border border-gray-300 p-1 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:focus:border-gray-200 disabled:focus:ring-0"
				id={elemID}
				type="number"
				value={value}
				onBlur={() => setDirty(true)}
				onChange={(e) => onChange(e.target.valueAsNumber)}
				{...addlProps}
			/>
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}
