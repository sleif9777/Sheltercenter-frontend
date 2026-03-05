// import "./CheckboxInput.scss"

import { faCheckCircle, faPaw, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useId } from "react"

import { HelpHover } from "./HelpHover"
import { BooleanInputProps } from "./InputHandlers"
import { InputErrorLabel } from "./InputLabels"

export type CheckboxChangeHandler = (checked: boolean) => void

// TODO: find better home
export interface ColorClasses {
	bgColor: string
	borderColor?: string
	checkedColor: string
	checkedTextColor?: string
	hoverBgColor: string
	hoverTextColor?: string
}

interface CheckboxInputProps {
	colorClasses?: ColorClasses
	customIcon?: IconDefinition
	className?: string
	helpText?: string
	centered?: boolean
	onChange: CheckboxChangeHandler
}

interface CheckboxComponentProps extends BooleanInputProps, CheckboxInputProps {}

export function Toggleable({
	className,
	colorClasses,
	customIcon,
	errors,
	fieldLabel,
	helpText,
	centered,
	value: checked,
	onChange,
	addlProps,
}: CheckboxComponentProps) {
	const elemID = useId()
	const isDisabled = addlProps?.disabled
	const bgClass = isDisabled ? "bg-gray-200" : (colorClasses?.bgColor ?? "bg-pink-100")
	const hoverClass = isDisabled ? "" : (colorClasses?.hoverBgColor ?? "hover:bg-pink-300")
	const bgClasses = `${bgClass} ${hoverClass}`
	const checkedBgClass = colorClasses?.checkedColor ?? "bg-pink-700"
	const checkedTextClass = colorClasses?.checkedTextColor ?? "text-gray-100"
	const checkedClasses = `${checkedBgClass} ${checkedTextClass}`
	const cursorClass = isDisabled ? "cursor-not-allowed" : "cursor-pointer"

	return (
		<div className="flex flex-col gap-y-1">
			<div className={(centered ? "m-auto" : "") + " flex flex-row gap-x-0.5"}>
				<div
					className={
						className +
						" inline-flex items-start rounded-md px-1 py-0.5 text-[16px] " +
						(checked ? `${checkedClasses} font-extrabold` : bgClasses)
					}
				>
					<label className={cursorClass + " flex items-start gap-x-1.5 select-none"} htmlFor={elemID}>
						<input
							checked={checked}
							className="hidden"
							disabled={addlProps?.disabled}
							id={elemID}
							type="checkbox"
							onChange={(e) => onChange(e.target.checked)}
						/>
						<FontAwesomeIcon className="mt-0.5 shrink-0" icon={checked ? faCheckCircle : (customIcon ?? faPaw)} />
						<span className="wrap-break-word uppercase">{fieldLabel}</span>
					</label>
				</div>
				{helpText && <HelpHover tooltip={helpText} />}
			</div>
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}

// Wrapper with button-like styling
export function CheckboxInput({
	className,
	colorClasses,
	customIcon,
	errors,
	fieldLabel,
	helpText,
	value: checked,
	onChange,
	addlProps,
}: CheckboxComponentProps) {
	const borderClass = addlProps?.disabled
		? "border-gray-500"
		: checked
			? "border-0"
			: (colorClasses?.borderColor ?? "border-pink-700")

	return (
		<Toggleable
			addlProps={addlProps}
			className={className + " h-full border px-1.5 " + borderClass}
			colorClasses={colorClasses}
			customIcon={customIcon}
			errors={errors}
			fieldLabel={fieldLabel}
			helpText={helpText}
			value={checked}
			onChange={onChange}
		/>
	)
}
