import moment from "moment-timezone"

import { DateTime } from "../../../utils/DateTimeUtils"
import { ActivityLevel, AdopterApprovalStatus, AgePreference, GenderPreference, HousingOwnership, HousingType } from "../enums/AdopterEnums"

export interface IAdopterBase {
    ID: number,

    primaryEmail: string,
    firstName: string,
    lastName: string,
    
    fullName: string,
    disambiguatedName: string,

    status: AdopterApprovalStatus,
    lastUploaded: string,
}

export interface IAdopter extends IAdopterBase {
    // USER PROFILE ITEMS
    city?: string,
    state?: string,
    phoneNumber?: string,
    userID: number,
    
    // APPLICATION ITEMS
    shelterluvAppID?: string,
    shelterluvID?: string,
    approvedUntil: Date,

    // HOUSING ENVIRONMENT ITEMS
    housingOwnership?: HousingOwnership,
    housingType?: HousingType,
    activityLevel?: ActivityLevel,
    hasFence: boolean,
    dogsInHome: boolean,
    catsInHome: boolean,
    otherPetsInHome: boolean,
    otherPetsComment?: string,
    
    // NOTES ITEMS
    applicationComments?: string,
    internalNotes?: string,
    adopterNotes?: string,

    // ADOPTER PREFERENCE ITEMS
    genderPreference?: GenderPreference,
    agePreference?: AgePreference,
    minWeightPreference?: number,
    maxWeightPreference?: number,
    lowAllergy: boolean,

    // VISIT LOGISTICS ITEMS
    mobility: boolean,
    bringingDog: boolean,

    // SECURITY ITEMS
    restrictedCalendar: boolean,
}

export class Adopter implements IAdopter {
    ID: number
    
    primaryEmail: string
    firstName: string
    lastName: string
    fullName: string
    disambiguatedName: string
    city?: string
    state?: string
    phoneNumber?: string
    status: number
    lastUploaded: string
    userID: number
    
    shelterluvAppID?: string
    shelterluvID?: string
    approvedUntil: Date
    
    housingOwnership?: HousingOwnership
    housingType?: HousingType
    activityLevel?: ActivityLevel
    hasFence: boolean
    dogsInHome: boolean
    catsInHome: boolean
    otherPetsInHome: boolean
    otherPetsComment?: string

    applicationComments?: string
    internalNotes?: string
    adopterNotes?: string
    
    genderPreference?: GenderPreference
    agePreference?: AgePreference
    minWeightPreference?: number
    maxWeightPreference?: number
    lowAllergy: boolean

    mobility: boolean
    bringingDog: boolean

    restrictedCalendar: boolean

    constructor(dto: IAdopter) {
        this.ID = dto.ID

        this.primaryEmail = dto.primaryEmail
        this.firstName = dto.firstName
        this.lastName = dto.lastName
        this.fullName = dto.fullName
        this.disambiguatedName = dto.disambiguatedName
        this.city = dto.city
        this.state = dto.state
        this.phoneNumber = dto.phoneNumber
        this.status = dto.status
        this.lastUploaded = dto.lastUploaded
        this.userID = dto.userID

        this.shelterluvAppID = dto.shelterluvAppID
        this.shelterluvID = dto.shelterluvID
        this.approvedUntil = dto.approvedUntil
        
        this.housingOwnership = dto.housingOwnership,
        this.housingType = dto.housingType
        this.activityLevel = dto.activityLevel
        this.hasFence = dto.hasFence
        this.dogsInHome = dto.dogsInHome
        this.catsInHome = dto.catsInHome
        this.otherPetsInHome = dto.otherPetsInHome
        this.otherPetsComment = dto.otherPetsComment

        this.applicationComments = dto.applicationComments
        this.adopterNotes = dto.adopterNotes
        this.internalNotes = dto.internalNotes

        this.genderPreference = dto.genderPreference
        this.agePreference = dto.agePreference
        this.minWeightPreference = dto.minWeightPreference
        this.maxWeightPreference = dto.maxWeightPreference
        this.lowAllergy = dto.lowAllergy

        this.mobility = dto.mobility
        this.bringingDog = dto.bringingDog

        this.restrictedCalendar = dto.restrictedCalendar
    }

    getFullName() {
        return this.firstName + " " + this.lastName
    }

    static matchesSearch(adopter: IAdopterBase, filterText: string) {
        if (filterText === "") { return false }

        filterText = filterText.toLowerCase()
        return adopter.fullName.toLowerCase().startsWith(filterText) ||
            adopter.lastName.toLowerCase().startsWith(filterText) ||
            adopter.primaryEmail.toLowerCase().startsWith(filterText)
    }

    getCityAndState() {
        if (!this.city || !this.state) {
            return ""
        }

        return `From ${this.city}, ${this.state}`
    }

    getApprovalExpirationDate(): string {
        switch(this.status) {
            case AdopterApprovalStatus.APPROVED:
                return this.approvalExpired() 
                    ? "Application expired" 
                    : `Approved until ${new DateTime(this.approvedUntil).Format("MMM D, YYYY")}`
            case AdopterApprovalStatus.DENIED:
                return "Application denied"
            case AdopterApprovalStatus.PENDING:
                return "Application pending"
            default:
                return ""
        }
    }

    approvalExpired(): boolean {
        return moment(this.approvedUntil).diff(moment(), "days") < 0
    }

    getActivityLevel() {
        if (this.activityLevel == undefined) {
            return ""
        }

        switch(this.activityLevel) {
            case ActivityLevel.LOW:
                return "Low activity household"
            case ActivityLevel.MEDIUM:
                return "Medium activity household"
            case ActivityLevel.HIGH:
                return "High activity household"
            case ActivityLevel.VERY_HIGH:
                return "Very high activity household"
        }
    }
    
    getGenderPreference() {
        switch (this.genderPreference) {
            case GenderPreference.MALES:
                return "Only interested in males"
            case GenderPreference.FEMALES:
                return "Only interested in females"
        }

        return ""
    }

    getAgePreference() {
        switch (this.agePreference) {
            case AgePreference.ADULTS:
                return "Only interested in adults"
            case AgePreference.PUPPIES:
                return "Only interested in puppies"
        }

        return ""
    }

    getWeightPreference() {
        if (this.minWeightPreference && this.maxWeightPreference) {
            return `Prefers between ${this.minWeightPreference} and ${this.maxWeightPreference} lbs.`
        } else if (this.minWeightPreference) {
            return `Prefers over ${this.minWeightPreference} lbs.`
        } else if (this.maxWeightPreference) {
            return `Prefers under ${this.maxWeightPreference} lbs.`
        }

        return ""
    }

    getAllergyPreference() {
        return this.lowAllergy ? "Prefers low-allergy/hypoallergenic!" : ""
    }

    getFencing() {
        return this.hasFence ? "Has fence" : ""
    }

    getHousingType() {
        switch (this.housingType) {
            case HousingType.HOUSE:
                return "House"
            case HousingType.APARTMENT:
                return "Apartment"
            case HousingType.CONDO:
                return "Condo"
            case HousingType.TOWNHOUSE:
                return "Townhouse"
            case HousingType.DORM:
                return "Dorm"
            case HousingType.MOBILE_HOME:
                return "Mobile Home"
        }
    }

    getHousingOwnership() {
        switch (this.housingOwnership) {
            case HousingOwnership.OWN:
                return "Own"
            case HousingOwnership.RENT:
                return "Rent"
            case HousingOwnership.LIVES_WITH_PARENTS:
                return "Lives with Parents"
        }
    }

    getHousing() {
        const housingTypeStr = this.getHousingType()
        const housingOwnershipStr = this.getHousingOwnership()

        if (housingTypeStr && housingOwnershipStr) {
            return `${housingTypeStr} (${housingOwnershipStr})`
        } else if (housingTypeStr) {
            return `${housingTypeStr}`
        } else if (housingOwnershipStr) {
            return `Unknown Housing Type (${housingOwnershipStr})`
        }

        return ""
    }

    getPetsInHome() {
        const pets = []

        if (this.dogsInHome) {
            pets.push('dogs')
        }

        if (this.catsInHome) {
            pets.push('cats')
        }

        if (this.otherPetsInHome) {
            pets.push(`other (${this.otherPetsComment})`)
        }

        return pets.length > 0
            ? "Pets in home: " + pets.join(", ")
            : ""
    }

    getAboutSectionData(): string[] {
        return [
            this.getActivityLevel(),
            this.getCityAndState(),
            this.getGenderPreference(),
            this.getAgePreference(),
            this.getWeightPreference(),
            this.getAllergyPreference(),
            this.getHousing(),
            this.getFencing(),
            this.getPetsInHome()
        ].filter(i => i.length > 0)
    }
}