import { useCallback } from "react"

import { Toggleable } from "./CheckboxInput"
import { InputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"
import { SelectInputOption } from "./SelectInput"

interface CheckboxGroupInputProps<T> extends InputProps {
	columnOverride?: string
	emptyText?: string
	hidden?: boolean
	options: SelectInputOption<T>[]
	value: T[]
	onChange: (value: T[]) => void
}

// Multi-select counterpart to RadioInput: same paw toggles, any number checked
export default function CheckboxGroupInput<T extends string | number>({
	className,
	columnOverride,
	emptyText,
	errors,
	fieldLabel,
	hidden,
	options,
	showRecommended,
	showRequired,
	value,
	onChange,
}: CheckboxGroupInputProps<T>) {
	const handleToggle = useCallback(
		(option: T, checked: boolean) => {
			onChange(checked ? [...value, option] : value.filter((v) => v !== option))
		},
		[onChange, value]
	)

	return (
		<div className={"flex flex-col gap-1 " + (className ?? "")} hidden={hidden}>
			<InputLabel
				errors={errors}
				fieldLabel={fieldLabel}
				showError={(errors ?? []).length > 0}
				showRecommended={showRecommended && value.length == 0}
				showRequired={showRequired && value.length == 0}
			/>
			{options.length == 0 ? (
				emptyText && <p className="text-left text-sm italic">{emptyText}</p>
			) : (
				<div className="max-w-fit rounded-lg border border-pink-700 bg-pink-100">
					<ul className={(columnOverride ?? "columns-1 sm:columns-2 lg:columns-1 xl:columns-2") + " left-0 ml-2 p-1.5 ps-0"}>
						{options.map((option) => (
							<li className="my-0.5" key={option.value}>
								<Toggleable
									className="text-left"
									fieldLabel={option.label}
									value={value.includes(option.value)}
									onChange={(checked) => handleToggle(option.value, checked)}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}
