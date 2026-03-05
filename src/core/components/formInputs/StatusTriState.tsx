import { faBan, faCheck, faHourglass, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useState } from "react"

import { AdopterApprovalStatus } from "../../../enums/AdopterEnums"
import { CheckboxInput, ColorClasses } from "./CheckboxInput"
import { RequiredEnumInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"
import { SelectInputOption } from "./SelectInput"

export interface TriStateOption extends SelectInputOption<AdopterApprovalStatus> {
	colors: ColorClasses
	icon: IconDefinition
}

type StatusTriStateComponentProps = RequiredEnumInputProps<AdopterApprovalStatus>

export default function StatusTriState({
	errors,
	fieldLabel,
	value,
	onChange,
	showRecommended,
	showRequired,
}: StatusTriStateComponentProps) {
	const [dirty, setDirty] = useState<boolean>(false)
	const options: TriStateOption[] = [
		{
			colors: {
				bgColor: "bg-green-100",
				borderColor: "border-green-800",
				checkedColor: "bg-green-800",
				hoverBgColor: "hover:bg-green-300",
			},
			icon: faCheck,
			label: "Approved",
			value: AdopterApprovalStatus.APPROVED,
		},
		{
			colors: {
				bgColor: "bg-yellow-100",
				borderColor: "border-yellow-800",
				checkedColor: "bg-yellow-800",
				hoverBgColor: "hover:bg-yellow-300",
			},
			icon: faHourglass,
			label: "Pending",
			value: AdopterApprovalStatus.PENDING,
		},
		{
			colors: {
				bgColor: "bg-red-100",
				borderColor: "border-red-800",
				checkedColor: "bg-red-800",
				hoverBgColor: "hover:bg-red-300",
			},
			icon: faBan,
			label: "Denied",
			value: AdopterApprovalStatus.DENIED,
		},
	]

	const handleChange = useCallback(
		(v: AdopterApprovalStatus) => {
			setDirty(true)
			onChange(v)
		},
		[onChange]
	)

	return (
		<div className="flex flex-col gap-1">
			<InputLabel
				errors={errors}
				fieldLabel={fieldLabel}
				showError={(errors ?? []).length > 0}
				showRecommended={!dirty && showRecommended}
				showRequired={!dirty && showRequired}
			/>
			<div>
				<ul className="left-0 flex flex-row gap-x-2">
					{options?.map((option, i) => (
						<li className="my-0.5" key={i}>
							<CheckboxInput
								className="px-1.5"
								colorClasses={option.colors}
								customIcon={option.icon}
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
