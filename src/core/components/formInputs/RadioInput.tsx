// import "./RadioInput.scss"

import { useCallback, useState } from "react"

import { Toggleable } from "./CheckboxInput"
import { OptionalEnumInputProps, RequiredEnumInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"
import { SelectInputOption } from "./SelectInput"

export type RadioInputChangeHandler<T extends number> = (
	event: React.MouseEvent<HTMLElement, MouseEvent>,
	newValue: T
) => void

interface RadioInputProps<T> {
	columnOverride?: string
	checkboxClass?: string
	hidden?: boolean
	options: SelectInputOption<T>[]
}

interface OptionalRadioInputProps<T extends number> extends OptionalEnumInputProps<T>, RadioInputProps<T> {}
interface RequiredRadioInputProps<T extends number> extends RequiredEnumInputProps<T>, RadioInputProps<T> {}
type RadioInputComponentProps<T extends number> = OptionalRadioInputProps<T> | RequiredRadioInputProps<T>

export default function RadioInput<T extends number>({
	className,
	columnOverride,
	defaultDirty = false,
	errors,
	fieldLabel,
	hidden,
	value,
	options,
	onChange,
	showRecommended,
	showRequired,
}: RadioInputComponentProps<T>) {
	const [dirty, setDirty] = useState<boolean>(defaultDirty)

	const handleChange = useCallback(
		(v: T) => {
			setDirty(true)
			onChange(v)
		},
		[onChange]
	)

	return (
		<div className={"flex flex-col gap-1 " + className} hidden={hidden}>
			<InputLabel
				errors={errors}
				fieldLabel={fieldLabel}
				showError={(errors ?? []).length > 0}
				showRecommended={!dirty && showRecommended}
				showRequired={!dirty && showRequired}
			/>
			<div className="max-w-fit rounded-lg border border-pink-700 bg-pink-100">
				<ul className={(columnOverride ?? "columns-1 sm:columns-2 lg:columns-1 xl:columns-2") + " left-0 ml-2 p-1.5 ps-0"}>
					{options?.map((option, i) => (
						<li className="my-0.5" key={i}>
							<Toggleable
								centered={!!columnOverride}
								className="text-left"
								fieldLabel={option.label}
								value={option.value === value} // controlled boolean
								onChange={() => handleChange(option.value)}
							/>
						</li>
					))}
				</ul>
			</div>
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}
