export enum AdopterApprovalStatus {
	APPROVED,
	PENDING,
	DENIED,
}

export const AdopterApprovalStatusLabel: Record<AdopterApprovalStatus, string> = {
	[AdopterApprovalStatus.APPROVED]: "Approved",
	[AdopterApprovalStatus.PENDING]: "Pending",
	[AdopterApprovalStatus.DENIED]: "Denied",
}

export enum HousingOwnership {
	OWN,
	RENT,
	LIVES_WITH_PARENTS,
}

export const HousingOwnershipLabel: Record<HousingOwnership, string> = {
	[HousingOwnership.OWN]: "Own",
	[HousingOwnership.RENT]: "Rent",
	[HousingOwnership.LIVES_WITH_PARENTS]: "Lives with parents",
}

export enum ActivityLevel {
	LOW,
	MEDIUM,
	ACTIVE,
	VERY_ACTIVE,
}

export const ActivityLevelLabel: Record<ActivityLevel, string> = {
	[ActivityLevel.LOW]: "Low",
	[ActivityLevel.MEDIUM]: "Medium",
	[ActivityLevel.ACTIVE]: "Active",
	[ActivityLevel.VERY_ACTIVE]: "Very active",
}

export enum GenderPreference {
	MALES,
	FEMALES,
	NO_PREFERENCE,
}

export const GenderPreferenceLabel: Record<GenderPreference, string> = {
	[GenderPreference.MALES]: "Males",
	[GenderPreference.FEMALES]: "Females",
	[GenderPreference.NO_PREFERENCE]: "No preference",
}

export enum AgePreference {
	ADULTS,
	PUPPIES,
	NO_PREFERENCE,
}

export const AgePreferenceLabel: Record<AgePreference, string> = {
	[AgePreference.ADULTS]: "Adults",
	[AgePreference.PUPPIES]: "Puppies",
	[AgePreference.NO_PREFERENCE]: "No preference",
}

export enum HousingType {
	HOUSE,
	APARTMENT,
	CONDO,
	TOWNHOUSE,
	DORM,
	MOBILE_HOME,
}

export const HousingTypeLabel: Record<HousingType, string> = {
	[HousingType.HOUSE]: "House",
	[HousingType.APARTMENT]: "Apartment",
	[HousingType.CONDO]: "Condo",
	[HousingType.TOWNHOUSE]: "Townhouse",
	[HousingType.DORM]: "Dorm",
	[HousingType.MOBILE_HOME]: "Mobile Home",
}
