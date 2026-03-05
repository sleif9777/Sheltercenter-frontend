import { faCat, faDog, faHorse, faPaw, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useEffect, useState } from "react"

import { CheckboxInput, Toggleable } from "../../core/components/formInputs/CheckboxInput"
import {
	BooleanInputProps,
	OptionalEnumInputProps,
	OptionalValueInputProps,
} from "../../core/components/formInputs/InputHandlers"
import { InputErrorLabel, InputLabel } from "../../core/components/formInputs/InputLabels"
import { NumberInput } from "../../core/components/formInputs/NumberInput"
import RadioInput from "../../core/components/formInputs/RadioInput"
import { FormSubmitHandler } from "../../core/components/formInputs/SubmissionButton"
import { TextInput } from "../../core/components/formInputs/TextInput"
import { Message, MessageLevel } from "../../core/components/messages/Message"
import { showToast } from "../../core/components/messages/ToastProvider"
import { SessionState } from "../../core/session/SessionState"
import { ActivityLevel, AgePreference, GenderPreference, HousingOwnership, HousingType } from "../../enums/AdopterEnums"
import { AppointmentType } from "../../enums/AppointmentEnums"
import { AdoptersAPI } from "../../api/adopters/AdoptersAPI"
import { AdopterPreferencesRequest } from "../../api/adopters/Requests"
import { BookingFormFieldUpdater } from "../bookings/BookingFormState"
import { FormProvider } from "../FormProvider"
import { ErrorMap } from "../FormState"
import { AdopterPreferencesFormFieldUpdater, useAdopterPreferenceFormState } from "./AdopterPreferenceFormState"

export function AdopterPreferencesForm({ adopterID, session }: { adopterID: number; session: SessionState }) {
	// --- form state ---
	const formState = useAdopterPreferenceFormState()
	const { setField, setAll, errors, ...fields } = formState

	// --- load adopter preferences ---
	const loadAdopterPreferences = useCallback(
		async (id: number) => {
			const resp = await new AdoptersAPI().GetAdopterPreferences(id)
			setAll(resp.pref)
		},
		[setAll]
	)

	// --- prepare POST request ---
	const handleSubmit: FormSubmitHandler<AdopterPreferencesRequest> = useCallback(async (req) => {
		await new AdoptersAPI().UpdateAdopterPreferences(req)
		showToast({ level: MessageLevel.Success, message: "Preferences saved!" })
	}, [])

	useEffect(() => {
		setField("adopterID", adopterID)
		loadAdopterPreferences(adopterID)
	}, [adopterID, loadAdopterPreferences, setField])

	if (!formState) {
		return <div>Loading...</div>
	}

	return (
		<>
			<FormProvider avoidReset formState={formState} onSubmit={handleSubmit}>
				<AllFieldsOptionalMessage session={session} />
				<AdopterPreferenceFieldset errors={errors} formData={fields} session={session} setField={setField} />
			</FormProvider>
		</>
	)
}

export function AllFieldsOptionalMessage({ session }: { session: SessionState }) {
	const errors = [
		{
			error: session.adopterUser,
			message: "All fields are optional.",
		},
		{
			error: true,
			message:
				"All fields (except Adopter) are optional. Only adopters that have a valid application and no active booking are available.",
		},
	]
	return <WarningMessage errors={errors} />
}

function WarningMessage({
	errors,
}: {
	errors: { error: boolean; message: string; level?: MessageLevel }[] // TODO: Make this a type
}) {
	const error = errors.find((e) => e.error)

	if (!error) {
		return null
	}

	return <Message level={MessageLevel.Default} message={error.message} />
}

// ----------------------
// Fieldset
// ----------------------

export function AdopterPreferenceFieldset({
	apptType,
	errors,
	formData,
	setField,
	session,
}: {
	apptType?: AppointmentType
	errors: ErrorMap<AdopterPreferencesRequest>
	formData: AdopterPreferencesRequest
	session: SessionState
	setField: AdopterPreferencesFormFieldUpdater
}) {
	// helper to bind formData fields to value + onChange
	const bindField = <K extends keyof AdopterPreferencesRequest>(field: K) => ({
		errors: errors[field],
		onChange: (v: AdopterPreferencesRequest[K]) => setField(field, v),
		value: formData[field],
	})

	const weightErrors = (errors.maxWeightPreference ?? []).concat(errors.minWeightPreference ?? [])

	return (
		<div className="grid grid-cols-1 items-start gap-x-2 gap-y-1.5 lg:grid-cols-2">
			<NotesField formData={formData} session={session} setField={setField} />
			<GenderPreferenceField {...bindField("genderPreference")} />
			<AgePreferenceField {...bindField("agePreference")} apptType={apptType} />
			<WeightPreferencesField errors={weightErrors} formData={formData} setField={setField} />
			<div className="flex flex-col gap-y-1.5">
				<InputLabel fieldLabel="Let us know if you..." />
				<MobilityField {...bindField("mobility")} />
				<BringingDogField {...bindField("bringingDog")} />
				<LowShedField {...bindField("lowShed")} />
			</div>
			<HousingTypeField {...bindField("housingType")} />
			<HousingOwnershipField {...bindField("housingOwnership")} />
			<ActivityLevelField {...bindField("activityLevel")} />
			<HasFenceField {...bindField("hasFence")} />
			<PetsAtHomeField formData={formData} setField={setField} />
		</div>
	)
}

function GenderPreferenceField({ value, onChange }: OptionalEnumInputProps<GenderPreference>) {
	const options = [
		{ label: "Male", value: GenderPreference.MALES },
		{ label: "Female", value: GenderPreference.FEMALES },
		{ label: "No Preference", value: GenderPreference.NO_PREFERENCE },
	]
	return (
		<RadioInput
			fieldLabel="Gender Preference"
			options={options}
			value={value}
			onChange={(v: GenderPreference | undefined) => onChange(v)}
		/>
	)
}

function AgePreferenceField({
	apptType,
	value,
	onChange,
}: {
	apptType?: AppointmentType
} & OptionalEnumInputProps<AgePreference>) {
	const options = [
		{ label: "Adults", value: AgePreference.ADULTS },
		{ label: "Puppies", value: AgePreference.PUPPIES },
		{ label: "No Preference", value: AgePreference.NO_PREFERENCE },
	]
	return (
		<div className="flex flex-col gap-y-1">
			<RadioInput
				fieldLabel="Age Preference"
				options={options}
				value={value}
				onChange={(v: AgePreference | undefined) => onChange(v)}
			/>
			<AgePreferenceWarning apptType={apptType} value={value} />
		</div>
	)
}

// TODO: move to form validation
function AgePreferenceWarning({ value, apptType }: { value?: AgePreference; apptType?: AppointmentType }) {
	if (value === AgePreference.ADULTS && apptType === AppointmentType.PUPPIES) {
		return <InputErrorLabel errors={["This appointment is for puppies only"]} isWarning />
	}

	if (value === AgePreference.PUPPIES && apptType === AppointmentType.ADULTS) {
		return <InputErrorLabel errors={["This appointment is for adults only"]} isWarning />
	}
}

function HousingTypeField({ value, onChange }: OptionalEnumInputProps<HousingType>) {
	const options = [
		{ label: "House", value: HousingType.HOUSE },
		{ label: "Apartment", value: HousingType.APARTMENT },
		{ label: "Condo", value: HousingType.CONDO },
		{ label: "Townhouse", value: HousingType.TOWNHOUSE },
		{ label: "Dorm", value: HousingType.DORM },
		{ label: "Mobile Home", value: HousingType.MOBILE_HOME },
	]
	return (
		<RadioInput
			fieldLabel="Housing Type"
			options={options}
			value={value}
			onChange={(v: HousingType | undefined) => onChange(v)}
		/>
	)
}

function HousingOwnershipField({ value, onChange }: OptionalEnumInputProps<HousingOwnership>) {
	const options = [
		{ label: "Own", value: HousingOwnership.OWN },
		{ label: "Rent", value: HousingOwnership.RENT },
		{ label: "Live with Parents", value: HousingOwnership.LIVES_WITH_PARENTS },
	]
	return (
		<RadioInput
			fieldLabel="Housing Ownership"
			options={options}
			value={value}
			onChange={(v: HousingOwnership | undefined) => onChange(v)}
		/>
	)
}

function ActivityLevelField({ value, onChange }: OptionalEnumInputProps<ActivityLevel>) {
	const options = [
		{ label: "Low", value: ActivityLevel.LOW },
		{ label: "Medium", value: ActivityLevel.MEDIUM },
		{ label: "Active", value: ActivityLevel.ACTIVE },
		{ label: "Very Active", value: ActivityLevel.VERY_ACTIVE },
	]

	return (
		<RadioInput
			fieldLabel="Activity Level"
			options={options}
			value={value}
			onChange={(v: ActivityLevel | undefined) => onChange(v)}
		/>
	)
}

function HasFenceField({ value, onChange }: BooleanInputProps) {
	return <Toggleable fieldLabel="I have a fenced yard" value={value} onChange={onChange} />
}

function LowShedField({ value, onChange }: BooleanInputProps) {
	return <Toggleable customIcon={faPaw} fieldLabel="prefer a low-shed dog" value={value} onChange={onChange} />
}

function MobilityField({ value, onChange }: BooleanInputProps) {
	return <Toggleable fieldLabel="need mobility assistance" value={value} onChange={onChange} />
}

function BringingDogField({ value, onChange }: BooleanInputProps) {
	return <Toggleable fieldLabel="are bringing your dog(s)" value={value} onChange={onChange} />
}

function PetsAtHomeField({
	formData,
	setField,
}: {
	formData: AdopterPreferencesRequest
	setField: BookingFormFieldUpdater
}) {
	// pet fields for mapping
	const petFields: {
		field: keyof AdopterPreferencesRequest
		label: string
		icon: IconDefinition
	}[] = [
		{ field: "hasDogs", icon: faDog, label: "Dogs" },
		{ field: "hasCats", icon: faCat, label: "Cats" },
		{ field: "hasOtherPets", icon: faHorse, label: "Other/Farm/Exotic" },
	]

	return (
		<div className="flex flex-col gap-y-1">
			<InputLabel fieldLabel="I have the following pets at home:" showError={false} />
			<ul
				className="flex list-none flex-col gap-y-1.5 pl-0"
				style={{
					listStyleType: "none",
					paddingLeft: 0,
				}}
			>
				{petFields.map(({ field, label, icon }, i) => (
					<li key={i}>
						<Toggleable
							customIcon={icon}
							fieldLabel={label}
							value={formData[field] as boolean}
							onChange={(n) => setField(field, n)}
						/>
						{field === "hasOtherPets" && formData.hasOtherPets && (
							<OtherPetsCommentField
								value={formData.otherPetsComment}
								onChange={(n: string | undefined) => setField("otherPetsComment", n)}
							/>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}

function OtherPetsCommentField({ value, onChange }: OptionalValueInputProps<string>) {
	return <TextInput fieldLabel="Other Pets Details" value={value ?? ""} onChange={(e) => onChange(e)} />
}

function NotesField({
	formData,
	setField,
	session,
}: {
	formData: AdopterPreferencesRequest
	setField: BookingFormFieldUpdater
	session: SessionState
}) {
	let label, fieldID: keyof AdopterPreferencesRequest

	if (session.adminUser) {
		label = "Internal Notes"
		fieldID = "internalNotes"
	} else {
		label = "Who do you want to meet?"
		fieldID = "adopterNotes"
	}

	return <TextInput fieldLabel={label} value={formData[fieldID] ?? ""} onChange={(n) => setField(fieldID, n)} />
}

function WeightPreferencesField({
	errors,
	formData,
	setField,
}: {
	errors: string[]
	formData: AdopterPreferencesRequest
	setField: BookingFormFieldUpdater
}) {
	const onNumberChange = (field: "minWeightPreference" | "maxWeightPreference") => (newVal: number) =>
		setField(field, newVal)

	const [noMin, setNoMin] = useState<boolean>(false)
	const [noMax, setNoMax] = useState<boolean>(false)

	const handleNoMinMaxToggle = useCallback(
		(field: "minWeightPreference" | "maxWeightPreference") => {
			setField(field, undefined)
			if (field == "minWeightPreference") {
				setNoMin(!noMin)
			}

			if (field == "maxWeightPreference") {
				setNoMax(!noMax)
			}
		},
		[noMax, noMin, setField]
	)

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<div className="flex flex-col gap-0.5">
				<NumberInput
					addlProps={{
						disabled: noMin,
					}}
					fieldLabel="Min Weight"
					value={formData["minWeightPreference"] ?? 0}
					onChange={onNumberChange("minWeightPreference")}
				/>
				<CheckboxInput fieldLabel="No Min" value={noMin} onChange={() => handleNoMinMaxToggle("minWeightPreference")} />
			</div>
			<div className="flex flex-col gap-0.5">
				<NumberInput
					addlProps={{
						disabled: noMax,
					}}
					fieldLabel="Max Weight"
					value={formData["maxWeightPreference"] ?? 0}
					onChange={onNumberChange("maxWeightPreference")}
				/>
				<CheckboxInput fieldLabel="No Max" value={noMax} onChange={() => handleNoMinMaxToggle("maxWeightPreference")} />
			</div>
			{errors.length > 0 && <InputErrorLabel errors={errors} />}
		</div>
	)
}
