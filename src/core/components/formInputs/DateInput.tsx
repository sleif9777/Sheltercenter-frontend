import { useId, useState } from "react"
import { DatePicker } from "rsuite"

import { DateTime } from "../../../utils/DateTime"
import { DateInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

import "rsuite/DatePicker/styles/index.css"

export function DateInput({
	container,
	fieldLabel,
	onChange,
	placeholder,
	addlProps,
	showRecommended,
	showRequired,
	errors,
	value,
	size = "lg",
	currentYearOnly = true,
}: DateInputProps) {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(false)

	return (
		<>
			<InputLabel
				elemID={elemID}
				errors={errors}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={!dirty && showRecommended && !value}
				showRequired={!dirty && showRequired && !value}
			/>
			<DatePicker
				className="modal-date-picker"
				container={container}
				format="MM/dd/yyyy"
				id={elemID}
				limitStartYear={currentYearOnly ? value?.instant.get("year") : undefined}
				oneTap
				placeholder={placeholder?.GetShortDate()}
				shouldDisableDate={(d) => d.getDay() === 0}
				size={size}
				value={value?.instant.toDate()}
				weekStart={0}
				onBlur={() => setDirty(true)}
				onChange={(date) => {
					// oneTap pickers can close without blurring, so picking a date counts as touching the field too
					setDirty(true)
					onChange(new DateTime(date?.toISOString()))
				}}
				{...addlProps}
			/>
			{errors && dirty && <InputErrorLabel errors={errors} />}
		</>
	)
}
