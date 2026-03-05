import TextField from "@mui/material/TextField"
import { useId, useState } from "react"

import { StringInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

export function TextInput({
	className,
	defaultDirty = false,
	errors,
	fieldLabel,
	value,
	onChange,
	addlProps,
	showRecommended,
	showRequired,
}: StringInputProps) {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(defaultDirty)

	return (
		<div className={className + " flex flex-col gap-1"}>
			<InputLabel
				elemID={elemID}
				errors={errors}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={showRecommended && value.length < 1}
				showRequired={!dirty && showRequired && value.length < 1}
			/>
			<TextField
				fullWidth
				id={elemID}
				sx={{
					"& .MuiOutlinedInput-root": {
						"& fieldset": {
							borderColor: "#d1d5db", // gray-300
						},
						"&.Mui-focused fieldset": {
							borderColor: "#ec4899", // pink-500
							boxShadow: "0 0 0 2px rgba(236,72,153,0.3)", // Tailwind-style ring
						},
					},
					":disabled": {
						cursor: "not-allowed",
					},
					margin: 0,
				}}
				value={value}
				variant="outlined"
				onBlur={() => setDirty(true)}
				onChange={(e) => onChange(e.target.value)}
				{...addlProps}
			/>
			{errors && dirty && <InputErrorLabel errors={errors} />}
		</div>
	)
}
