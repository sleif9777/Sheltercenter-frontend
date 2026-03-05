import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import moment from "moment-timezone"
import { useCallback, useId, useState } from "react"

import { MomentOrNull } from "../../../utils/DateTime"
import { TimeInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

export type TimeChangeHandler = (m: MomentOrNull) => void

export function TimeInput({
	defaultDirty = false,
	errors,
	fieldLabel,
	hour,
	minute,
	onChange,
	addlProps,
	showRecommended,
	showRequired,
}: TimeInputProps) {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(defaultDirty)

	const handleChange = useCallback(
		(m: MomentOrNull) => {
			setDirty(true)
			onChange?.(m)
		},
		[onChange]
	)

	const value = moment.tz(
		{
			hour,
			minute,
		},
		"America/New_York"
	)

	return (
		<div className="flex flex-col gap-1">
			<InputLabel
				elemID={elemID}
				errors={errors}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={!dirty && showRecommended}
				showRequired={!dirty && showRequired}
			/>
			<LocalizationProvider dateAdapter={AdapterMoment} dateLibInstance={moment}>
				<TimePicker
					className="max-w-48"
					minutesStep={15}
					slotProps={{
						textField: {
							id: elemID,
						},
					}}
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
						margin: 0,
					}}
					timezone="America/New_York"
					value={value}
					onChange={handleChange}
					{...addlProps}
				/>
			</LocalizationProvider>
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}
