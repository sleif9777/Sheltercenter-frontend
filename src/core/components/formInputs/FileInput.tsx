import { ChangeEvent, useCallback } from "react"

import { FileInputProps } from "./InputHandlers"
import { InputErrorLabel } from "./InputLabels"

export function FileInput({ value, onChange, errors, inputKey }: FileInputProps & { inputKey?: string | number }) {
	const inputId = "batchUpload"

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.files ? e.target.files[0] : null)
		},
		[onChange]
	)

	return (
		<div className="m-auto mt-2 flex max-w-36 flex-col gap-y-1">
			<label
				className="text-md rounded-sm bg-gray-200 px-5 py-1 uppercase hover:cursor-pointer hover:bg-blue-200 hover:text-blue-900 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-300"
				htmlFor={inputId}
			>
				Choose File
			</label>
			<input className="sr-only" id={inputId} key={inputKey} type="file" onChange={handleChange} />
			<div className={`text-left font-mono text-[8px] wrap-normal`}>{value ? value.name : "No file chosen"}</div>
			{errors && <InputErrorLabel errors={errors} />}
		</div>
	)
}
