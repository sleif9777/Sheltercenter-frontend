import { AdopterApprovalStatus } from "../enums/AdopterEnums"

export interface IAdopter {
    ID: number,

    // USER PROFILE ITEMS
    primaryEmail: string,
    firstName: string,
    lastName: string,
    fullName: string,
    disambiguatedName: string,
    city?: string,
    state?: string,
    phoneNumber?: string,
    status: AdopterApprovalStatus,
    userID: number,
    
    // APPLICATION ITEMS
    shelterluvAppID?: string,
    shelterluvID?: string,
    approvedUntil: Date,

    // HOUSING ENVIRONMENT ITEMS
    housingOwnership?: number,
    housingType?: number,
    activityLevel?: number,
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
    genderPreference?: number,
    agePreference?: number,
    minWeightPreference?: number,
    maxWeightPreference?: number,
    lowAllergy: boolean,

    // VISIT LOGISTICS ITEMS
    mobility: boolean,
    bringingDog: boolean,
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
    userID: number
    
    shelterluvAppID?: string
    shelterluvID?: string
    approvedUntil: Date
    
    housingOwnership?: number
    housingType?: number
    activityLevel?: number
    hasFence: boolean
    dogsInHome: boolean
    catsInHome: boolean
    otherPetsInHome: boolean
    otherPetsComment?: string

    applicationComments?: string
    internalNotes?: string
    adopterNotes?: string
    
    genderPreference?: number
    agePreference?: number
    minWeightPreference?: number
    maxWeightPreference?: number
    lowAllergy: boolean

    mobility: boolean
    bringingDog: boolean

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
    }

    getFullName() {
        return this.firstName + " " + this.lastName
    }

    matchesSearch(filterText: string) {
        if (filterText === "") { return false }

        filterText = filterText.toLowerCase()
        return this.fullName.toLowerCase().startsWith(filterText) ||
            this.lastName.toLowerCase().startsWith(filterText) ||
            this.primaryEmail.toLowerCase().includes(filterText)
    }

    getHousingType() {
        // HOUSE = 1
        // CONDO = 2
        // TOWNHOUSE = 3
        // DORM = 4
        // MOBILE_HOME = 5
        
    }

    getCityAndState() {
        if (!this.city || !this.state) {
            return undefined
        }

        return `${this.city}, ${this.state}`
    }

    getPhoneNumber() {
        if (!this.phoneNumber) {
            return ""
        }

        return `(${this.phoneNumber.slice(0, 3)}) ${this.phoneNumber.slice(3, 6)}-${this.phoneNumber.slice(6, 10)}`
    }

    activityLevelStr = () => {
        if (!this.activityLevel) {
            return undefined
        }

        switch(this.activityLevel) {
            case 0:
                return "Low Activity Household"
            case 1:
                return "Medium Activity Household"
            case 2:
                return "High Activity Household"
            case 3:
                return "Very High Activity Household"
        }
    }
}