import { TextField } from "@mui/material"
import { TimePicker } from "@mui/x-date-pickers"
import { ComponentProps, KeyboardEventHandler, ReactNode } from "react"
import ReactQuill from "react-quill"
import { DatePickerProps } from "rsuite"
import { TypeAttributes } from "rsuite/esm/internals/types"

import { DateTime, MomentOrNull } from "../../../utils/DateTime"

export type OptionalChangeHandler<T> = (value?: T) => void
export type RequiredChangeHandler<T> = (value: T) => void

export interface InputProps {
	className?: string
	defaultDirty?: boolean
	errors?: string[]
	fieldLabel?: ReactNode
	labelClass?: string
	showRecommended?: boolean
	showRequired?: boolean
}

export interface OptionalValueInputProps<T> extends InputProps {
	onChange: OptionalChangeHandler<T>
	value?: T
}

export interface RequiredValueInputProps<T> extends InputProps {
	onChange: RequiredChangeHandler<T>
	value: T
}

export interface StringInputProps extends RequiredValueInputProps<string> {
	addlProps?: ComponentProps<typeof TextField>
	enterKeyHandler?: KeyboardEventHandler<HTMLInputElement>
}

export interface RichTextInputProps extends RequiredValueInputProps<ReactQuill.Value> {
	addlProps?: ComponentProps<typeof ReactQuill>
	bgColor?: string
}

export interface NumberInputProps extends RequiredValueInputProps<number> {
	addlProps?: ComponentProps<"input">
}

export interface BooleanInputProps extends RequiredValueInputProps<boolean> {
	addlProps?: ComponentProps<"input">
}

export interface FileInputProps extends RequiredValueInputProps<File | null> {
	addlProps?: ComponentProps<"button">
}

export interface DateInputProps extends OptionalValueInputProps<DateTime> {
	addlProps?: DatePickerProps
	container?: () => HTMLElement
	currentYearOnly?: boolean
	placeholder?: DateTime
	size?: TypeAttributes.Size
}

// Time field values are tracked by hour and minute. The value is calculated within the component, not externally.
export interface TimeInputProps extends Omit<RequiredValueInputProps<MomentOrNull>, "value"> {
	addlProps?: ComponentProps<typeof TimePicker>
	hour: number
	minute: number
}

export interface RequiredEnumInputProps<T extends number> extends RequiredValueInputProps<T> {}

export interface OptionalEnumInputProps<T extends number> extends OptionalValueInputProps<T> {}
