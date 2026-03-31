import { Autocomplete, TextField } from "@mui/material"
import { ComponentProps, ReactNode, useId, useState } from "react"

import { StringInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

export interface ValueLabelPair<T> {
	value: T
	label: string
}

export type SelectChangeHandler = (value: string | null) => Promise<void>

export interface SelectInputOption<T> extends ValueLabelPair<T> {}

export type SelectInputOptionResponse<T> = {
	options: SelectInputOption<T>[]
}

export interface SelectInputProps {
	hidden?: boolean
	options?: SelectInputOption<string>[]
	disabled?: boolean
	onChange: SelectChangeHandler
	showRequired?: boolean
	addlProps?: Partial<ComponentProps<typeof Autocomplete<SelectInputOption<string>, false, false, false>>>
	placeholder?: string
}

export interface SelectInputComponentProps
	extends SelectInputProps, Omit<StringInputProps, "value" | "onChange" | "addlProps"> {
	value: string | null
}

export default function SelectInput({
	errors,
	fieldLabel,
	showRecommended,
	showRequired,
	options,
	value,
	hidden,
	disabled,
	placeholder,
	onChange,
	addlProps,
}: SelectInputComponentProps): ReactNode {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(false)

	if (hidden) {
		return
	}

	// Find the selected option object based on value
	const selectedOption = options?.find((opt) => opt.value === value) || null

	return (
		<div className="flex flex-col gap-1">
			<InputLabel
				elemID={elemID}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={!dirty && showRecommended}
				showRequired={(value ?? "").length > 0 && !dirty && showRequired}
			/>
			<Autocomplete<SelectInputOption<string>, false, false, false>
				disabled={disabled}
				fullWidth
				getOptionLabel={(option) => option.label}
				id={elemID}
				isOptionEqualToValue={(option, value) => option.value === value.value}
				options={options ?? []}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={placeholder}
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									borderColor: "#d1d5db", // gray-300
								},
								"&.Mui-focused": {
									boxShadow: "0 0 0 2px rgba(236,72,153,0.3)", // pink ring
								},
								"&.Mui-focused fieldset": {
									borderColor: "#ec4899", // pink-500
								},
								"&:hover fieldset": {
									borderColor: "#9ca3af", // gray-400
								},
							},
						}}
					/>
				)}
				value={selectedOption}
				onBlur={() => setDirty(true)}
				onChange={(_, newValue) => {
					onChange(newValue?.value ?? null)
				}}
				{...addlProps}
			/>
			{errors && dirty && <InputErrorLabel errors={errors} />}
		</div>
	)
}
