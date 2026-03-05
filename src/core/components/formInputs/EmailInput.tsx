import * as EmailValidator from "email-validator"

import { StringInputProps } from "./InputHandlers"
import { TextInput } from "./TextInput"

export function EmailInput({
	addlProps,
	className,
	enterKeyHandler,
	errors,
	showRequired,
	showRecommended,
	onChange,
	value,
}: StringInputProps) {
	return (
		<TextInput
			addlProps={{
				autoComplete: "off",
				error: value.length > 0 && !EmailValidator.validate(value),
				margin: "dense",
				onKeyDown: enterKeyHandler,
				placeholder: "example@email.com",
				required: true,
				...addlProps,
			}}
			className={className}
			errors={errors}
			fieldLabel="Email Address"
			showRecommended={showRecommended}
			showRequired={showRequired}
			value={value}
			onChange={(e) => onChange(e)}
		/>
	)
}
