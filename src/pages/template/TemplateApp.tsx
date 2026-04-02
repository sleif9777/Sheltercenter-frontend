import { faShieldDog } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect } from "react"

import { TemplateCard } from "../../cards/templates/TemplateCard"
import { LargeButton } from "../../core/components/buttons/LargeButton"
import SelectInput, { SelectChangeHandler, SelectInputOption } from "../../core/components/formInputs/SelectInput"
import { Modal, useModalState } from "../../core/components/modal/Modal"
import { Weekday, WeekdayLabel } from "../../enums/TemplateEnums"
import { TemplateForm } from "../../forms/templates/TemplateForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../layouts/PlaceholderText/PlaceholderText"
import { TemplateHash } from "../../models/TemplateModels"
import { useTemplateState } from "./TemplateAppState"

export default function TemplateApp() {
	const template = useTemplateState()

	// Render the component
	useEffect(() => {
		template.refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<FullWidthPage title="Weekly Template">
			<div className="mx-5 mt-3 border-t-2 border-pink-700 py-2">
				<div className="m-auto w-xs">
					<WeekdaySelect />
				</div>
			</div>
			<TemplateContent />
		</FullWidthPage>
	)
}

function WeekdaySelect() {
	const template = useTemplateState()
	const weekdayOptions: SelectInputOption<string>[] = Object.values(Weekday)
		.filter((wd): wd is Weekday => typeof wd === "number" && wd !== Weekday.SUNDAY)
		.map((wd) => ({
			label: WeekdayLabel[wd],
			value: String(wd),
		}))

	const handleChange: SelectChangeHandler = useCallback(
		async (v) => {
			if (v) {
				await template.refresh(parseInt(v) as Weekday)
			}
		},
		[template]
	)

	return (
		<SelectInput
			fieldLabel="Weekday"
			options={weekdayOptions}
			value={String(template.weekday ?? "")}
			onChange={handleChange}
		/>
	)
}

function TemplateContent() {
	const template = useTemplateState()

	return (
		<>
			<TemplateFormModal />
			{template.templateHash && template.templateHash.length > 0 ? (
				template.templateHash.sort((a, b) => a.key - b.key).map((hash) => <TemplateTimeslot hash={hash} key={hash.key} />)
			) : (
				<PlaceholderText
					iconDef={faShieldDog}
					text={"No templates published for " + WeekdayLabel[template.weekday] + "."}
				/>
			)}
		</>
	)
}

function TemplateFormModal() {
	const modalState = useModalState()
	const template = useTemplateState()

	return (
		<>
			<LargeButton label="Add Template" onClick={modalState.open} />
			<Modal modalState={modalState} modalTitle="Add Template">
				<TemplateForm modalState={modalState} weekday={template.weekday} />
			</Modal>
		</>
	)
}

function TemplateTimeslot({ hash }: { hash: TemplateHash }) {
	return (
		<div className="pb-4" id={"timeslot-" + hash.key}>
			<div className="pb-1 pl-2 text-left text-2xl">{hash.label}</div>
			<ul className="columns-1 md:columns-2">
				{hash.value.map((template, i) => (
					<TemplateCard key={i} template={template} timeDisplay={hash.label} />
				))}
			</ul>
		</div>
	)
}
