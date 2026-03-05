import SelectInput, { SelectInputComponentProps, SelectInputOption } from "./SelectInput"

const STATE_OPTIONS: SelectInputOption<string>[] = [
	{ label: "Alabama (AL)", value: "AL" },
	{ label: "Alaska (AK)", value: "AK" },
	{ label: "Arizona (AZ)", value: "AZ" },
	{ label: "Arkansas (AR)", value: "AR" },
	{ label: "California (CA)", value: "CA" },
	{ label: "Colorado (CO)", value: "CO" },
	{ label: "Connecticut (CT)", value: "CT" },
	{ label: "Delaware (DE)", value: "DE" },
	{ label: "District of Columbia (DC)", value: "DC" },
	{ label: "Florida (FL)", value: "FL" },
	{ label: "Georgia (GA)", value: "GA" },
	{ label: "Hawaii (HI)", value: "HI" },
	{ label: "Idaho (ID)", value: "ID" },
	{ label: "Illinois (IL)", value: "IL" },
	{ label: "Indiana (IN)", value: "IN" },
	{ label: "Iowa (IA)", value: "IA" },
	{ label: "Kansas (KS)", value: "KS" },
	{ label: "Kentucky (KY)", value: "KY" },
	{ label: "Louisiana (LA)", value: "LA" },
	{ label: "Maine (ME)", value: "ME" },
	{ label: "Maryland (MD)", value: "MD" },
	{ label: "Massachusetts (MA)", value: "MA" },
	{ label: "Michigan (MI)", value: "MI" },
	{ label: "Minnesota (MN)", value: "MN" },
	{ label: "Mississippi (MS)", value: "MS" },
	{ label: "Missouri (MO)", value: "MO" },
	{ label: "Montana (MT)", value: "MT" },
	{ label: "Nebraska (NE)", value: "NE" },
	{ label: "Nevada (NV)", value: "NV" },
	{ label: "New Hampshire (NH)", value: "NH" },
	{ label: "New Jersey (NJ)", value: "NJ" },
	{ label: "New Mexico (NM)", value: "NM" },
	{ label: "New York (NY)", value: "NY" },
	{ label: "North Carolina (NC)", value: "NC" },
	{ label: "North Dakota (ND)", value: "ND" },
	{ label: "Ohio (OH)", value: "OH" },
	{ label: "Oklahoma (OK)", value: "OK" },
	{ label: "Oregon (OR)", value: "OR" },
	{ label: "Pennsylvania (PA)", value: "PA" },
	{ label: "Rhode Island (RI)", value: "RI" },
	{ label: "South Carolina (SC)", value: "SC" },
	{ label: "South Dakota (SD)", value: "SD" },
	{ label: "Tennessee (TN)", value: "TN" },
	{ label: "Texas (TX)", value: "TX" },
	{ label: "Utah (UT)", value: "UT" },
	{ label: "Vermont (VT)", value: "VT" },
	{ label: "Virginia (VA)", value: "VA" },
	{ label: "Washington (WA)", value: "WA" },
	{ label: "West Virginia (WV)", value: "WV" },
	{ label: "Wisconsin (WI)", value: "WI" },
	{ label: "Wyoming (WY)", value: "WY" },
	{ label: "──", value: "--" },
	{ label: "Alberta (AB)", value: "AB" },
	{ label: "British Columbia (BC)", value: "BC" },
	{ label: "Manitoba (MB)", value: "MB" },
	{ label: "New Brunswick (NB)", value: "NB" },
	{ label: "Newfoundland and Labrador (NL)", value: "NL" },
	{ label: "Northwest Territories (NT)", value: "NT" },
	{ label: "Nova Scotia (NS)", value: "NS" },
	{ label: "Nunavut (NU)", value: "NU" },
	{ label: "Ontario (ON)", value: "ON" },
	{ label: "Prince Edward Island (PE)", value: "PE" },
	{ label: "Quebec (QC)", value: "QC" },
	{ label: "Saskatchewan (SK)", value: "SK" },
	{ label: "Yukon (YT)", value: "YT" },
]

export function StateProvinceInput({ errors, showRequired, value, onChange }: SelectInputComponentProps) {
	return (
		<SelectInput
			addlProps={{
				getOptionDisabled: (option) => option.value === "--",
			}}
			errors={errors}
			fieldLabel="State/Province"
			options={STATE_OPTIONS}
			showRequired={showRequired}
			value={value}
			onChange={onChange}
		/>
	)
}
