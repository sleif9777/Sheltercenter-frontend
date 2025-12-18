export enum AdopterApprovalStatus {
    APPROVED,
    PENDING,
    DENIED,
}

export const AdopterApprovalStatusDisplay: Record<AdopterApprovalStatus, string> = {
    [AdopterApprovalStatus.APPROVED]: "Approved",
    [AdopterApprovalStatus.PENDING]: "Pending",
    [AdopterApprovalStatus.DENIED]: "Denied"
}

export enum HousingOwnership {
    OWN,
    RENT,
    LIVES_WITH_PARENTS
}

export enum HousingType {
    HOUSE,
    APARTMENT,
    CONDO,
    TOWNHOUSE,
    DORM,
    MOBILE_HOME
}

export enum ActivityLevel {
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
}

export enum GenderPreference {
    MALES,
    FEMALES,
    NO_PREFERENCE
}

export enum AgePreference {
    ADULTS,
    PUPPIES,
    NO_PREFERENCE
}