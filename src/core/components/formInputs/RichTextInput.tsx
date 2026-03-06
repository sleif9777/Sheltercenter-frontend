import "react-quill/dist/quill.snow.css"

import { useCallback, useId, useRef, useState } from "react"
import ReactQuill from "react-quill"

import { RichTextInputProps } from "./InputHandlers"
import { InputErrorLabel, InputLabel } from "./InputLabels"

export function RichTextInput({
	addlProps,
	bgColor,
	className,
	defaultDirty = false,
	errors,
	fieldLabel,
	value,
	onChange,
	showRecommended,
	showRequired,
}: RichTextInputProps) {
	const elemID = useId()
	const [dirty, setDirty] = useState<boolean>(defaultDirty)
	const quillRef = useRef<ReactQuill | null>(null)

	const handleChange = useCallback(
		(v: ReactQuill.Value) => {
			setDirty(true)
			onChange(v)
		},
		[onChange]
	)

	const BRAND_COLORS = [
		"#000000", // black

		"#a7396e", // pink
		"#8b0000", // dark red
		"#c2410c", // orange (burnt, readable)
		"#ca8a04", // yellow (mustard, non-neon)
		"#166534", // green (deep, stable)
		"#1e6c80", // teal
		"#1e40af", // blue (royal, calm)
		"#5b2d8b", // purple (plum, serious)

		"#6b7280", // dark grey
		"#e5e7eb", // light grey
	]

	const modules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			["bold", "italic", "underline", "strike"],
			[{ color: BRAND_COLORS }],
			[{ list: "ordered" }, { list: "bullet" }],
			["link", "clean"],
		],
	}

	return (
		<div className="flex flex-col gap-1 text-left">
			<InputLabel
				elemID={elemID}
				errors={errors}
				fieldLabel={fieldLabel}
				showError={dirty && (errors ?? []).length > 0}
				showRecommended={showRecommended && value.toString().length < 1}
				showRequired={!dirty && showRequired && value.toString().length < 1}
			/>
			<style>{`
				.quill-wrapper .ql-toolbar {
					border: none;
					border-bottom: 1px solid #e5e7eb;
					border-radius: 4px 4px 0 0;
				}
				
				.quill-wrapper .ql-container {
					border: none;
					border-radius: 0 0 4px 4px;
				}
				
				.quill-wrapper .ql-editor:focus {
					outline: none;
				}
			`}</style>
			<div className="quill-wrapper rounded border-2 border-gray-300 transition-all duration-200 focus-within:border-pink-500 focus-within:shadow-[0_0_0_2px_rgba(236,72,153,0.3)] hover:border-pink-500">
				<ReactQuill
					{...addlProps}
					className={className}
					modules={modules}
					ref={quillRef}
					style={{ backgroundColor: bgColor ?? "white", minHeight: "250px" }}
					theme="snow"
					value={value}
					onBlur={() => setDirty(true)}
					onChange={handleChange}
				/>
			</div>
			{errors && dirty && <InputErrorLabel errors={errors} />}
		</div>
	)
}
