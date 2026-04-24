import { useCallback, useEffect, useState } from "react"

import { OptionalValueInputProps } from "../../core/components/formInputs/InputHandlers"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { ModalState } from "../../core/components/modal/Modal"
import { useScheduleState } from "../../pages/schedule/ScheduleAppState"
import { AppointmentsAPI } from "../../api/appointments/AppointmentsAPI"
import { CheckInAppointmentRequest } from "../../api/appointments/Requests"
import { FormProvider } from "../FormProvider"
import { CheckInFormFieldUpdater, useCheckInFormState } from "./CheckInFormState"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil } from "@fortawesome/free-solid-svg-icons"
import { TooltipProvider } from "../../core/components/messages/TooltipProvider"
import { StateProvinceInput } from "../../core/components/formInputs/StateProvinceInput"
import { ErrorMap } from "../FormState"
import { StringUtils } from "../../utils/StringUtils"

export function CheckInForm({
	apptID,
	defaultValues,
	modalState,
	onSubmit,
}: {
	apptID: number
	defaultValues?: Partial<CheckInAppointmentRequest>
	modalState: ModalState
	onSubmit?: () => void
}) {
	// --- form state ---
	const formData = useCheckInFormState(),
		schedule = useScheduleState()
	const { errors, setField, ...fields } = formData

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<CheckInAppointmentRequest> = useCallback(
		async (req: CheckInAppointmentRequest) => {
			await new AppointmentsAPI().CheckInAppointment(req)
			onSubmit?.()
			schedule.refresh()
		},
		[onSubmit, schedule]
	)

	// --- initialize if booking exists ---
	useEffect(() => {
		setField("apptID", apptID)

		if (defaultValues) {
			Object.entries(defaultValues).forEach(([field, value]) => {
				setField(field as keyof CheckInAppointmentRequest, value)
			})
		}
	}, [apptID, defaultValues, setField])

	return (
		<FormProvider formState={formData} modalState={modalState} onSubmit={handleSubmit}>
			<Fieldset errors={errors} formData={fields} setField={setField} />
		</FormProvider>
	)
}

function Fieldset({
	errors,
	formData,
	setField,
}: {
	errors: ErrorMap<CheckInAppointmentRequest>
	formData: CheckInAppointmentRequest
	setField: CheckInFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof CheckInAppointmentRequest>(field: K) => ({
		addressValue: formData.streetAddress,
		errors: errors[field],
		onChange: (v: CheckInAppointmentRequest[K]) => setField(field, v),
		value: formData[field],
	})
	const defaultAddressMode =
		StringUtils.isNotNull(formData.streetAddress) ||
		StringUtils.isNotNull(formData.city) ||
		StringUtils.isNotNull(formData.state) ||
		StringUtils.isNotNull(formData.postalCode)

	const [editAddressMode, setEditAddressMode] = useState<boolean>(defaultAddressMode)

	const handleStateProvinceChange = useCallback(
		async (value: string | null) => {
			const state = value ?? "--"
			setField("state", state)
		},
		[setField]
	)

	return (
		<div className="flex flex-col gap-y-1">
			<CounselorField {...bindField("counselor")} />
			<ClothingDescriptionField {...bindField("clothingDescription")} />
			<div className="mt-2 border-t pt-2 text-left">
				<span className="text-lg font-medium text-pink-700 uppercase">Verify Address</span>
				{editAddressMode ? (
					<div className="mt-2 grid grid-cols-2 grid-rows-2 gap-x-5 gap-y-2">
						<StreetAddressField {...bindField("streetAddress")} />
						<CityField {...bindField("city")} />
						<StateProvinceInput
							addlProps={{
								autoComplete: false,
							}}
							errors={errors["state"]}
							showRequired={(formData.streetAddress ?? "").length > 0}
							value={formData["state"] ?? "--"}
							onChange={handleStateProvinceChange}
						/>
						<PostalCodeField {...bindField("postalCode")} />
					</div>
				) : (
					<div className="flex flex-row gap-x-5">
						<div className="flex flex-col text-[16px] font-light text-gray-500 italic">
							<span>{formData["streetAddress"]}</span>
							<span>
								{formData["city"]}, {formData["state"]} {formData["postalCode"]}
							</span>
						</div>
						<TooltipProvider tooltip="Edit this address">
							<button
								className="cursor-pointer rounded border-2 border-gray-700 bg-gray-200 px-2 py-1 text-gray-700 hover:border-red-700 hover:text-red-700"
								type="button"
								onClick={() => setEditAddressMode(true)}
							>
								<FontAwesomeIcon icon={faPencil} />
							</button>
						</TooltipProvider>
					</div>
				)}
			</div>
		</div>
	)
}

function CounselorField({ value, onChange }: OptionalValueInputProps<string>) {
	return <TextInput fieldLabel="Counselor" showRecommended value={value ?? ""} onChange={(e) => onChange(e)} />
}

function ClothingDescriptionField({ value, onChange }: OptionalValueInputProps<string>) {
	return (
		<TextInput fieldLabel="Clothing Description" showRecommended value={value ?? ""} onChange={(e) => onChange(e)} />
	)
}

interface AddressFieldProps extends OptionalValueInputProps<string> {
	addressValue?: string
}

function StreetAddressField({ addressValue, errors, value, onChange }: AddressFieldProps) {
	return (
		<TextInput
			addlProps={{ autoComplete: "new-password" }}
			errors={errors}
			fieldLabel="Street Address"
			showRequired={(addressValue ?? "").length > 0}
			value={value ?? ""}
			onChange={(e) => onChange(e)}
		/>
	)
}

function CityField({ addressValue, errors, value, onChange }: AddressFieldProps) {
	return (
		<TextInput
			addlProps={{ autoComplete: "new-password" }}
			errors={errors}
			fieldLabel="City"
			showRequired={(addressValue ?? "").length > 0}
			value={value ?? ""}
			onChange={(e) => onChange(e)}
		/>
	)
}

function PostalCodeField({ addressValue, errors, value, onChange }: AddressFieldProps) {
	return (
		<TextInput
			addlProps={{ autoComplete: "new-password" }}
			errors={errors}
			fieldLabel="Postal Code"
			showRequired={(addressValue ?? "").length > 0}
			value={value ?? ""}
			onChange={(e) => onChange(e)}
		/>
	)
}
