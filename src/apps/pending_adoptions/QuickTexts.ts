import moment from 'moment-timezone';
import { useStore } from "zustand";
import { IQuickText } from "../messaging/QuickText";
import { IPendingAdoption } from "./models/PendingAdoption";
import { useSessionState } from "../../session/SessionState";

export function ChosenBoardUpdateQuickTexts(adoption: IPendingAdoption): IQuickText[] {
    const BaseUpdateQuickText = (symptom: string, adoption: IPendingAdoption) => `Hi ${adoption.adopter.firstName},\n\nJust a quick update on ${adoption.dog}! They had a vet visit today and, unfortunately, they've got ${symptom} — a common sign of an upper respiratory infection. Not the best news, but the good news is we've got them on new meds, and they'll be seeing the vet again next week for a follow-up.\n\nKind regards,\nThe Adoptions Team\nSaving Grace Animals for Adoption`
    
    return [
        {
            name: "Cough",
            value: 0,
            text: BaseUpdateQuickText("a cough", adoption)
        },
        {
            name: "Nasal Discharge",
            value: 1,
            text: BaseUpdateQuickText("some nasal discharge", adoption)
        }
    ]
}


export function ChosenBoardR2RQuickText(adoption: IPendingAdoption, heartworm: boolean): IQuickText[] {
    const session = useStore(useSessionState)
    let quickText: (adoption: IPendingAdoption) => string, label: string

    type BusinessDayDetails = { todayClose: string, nextBusDay: string, openHour: string, closeHour: string }

    function getBusinessDayDetails(): BusinessDayDetails {
        const now = moment().tz("America/New_York") // Get current time in Eastern Time Zone
        
        type BusinessHours = { [key: string]: { open: number, close: number } }

        // Define the business hours for each day
        const businessHours: BusinessHours = {
            'Mon': { open: 12, close: 18 },
            'Tue': { open: 12, close: 18 },
            'Wed': { open: 12, close: 18 },
            'Thu': { open: 13, close: 18 },
            'Fri': { open: 12, close: 18 },
            'Sat': { open: 12, close: 15 },
        }
    
        // Helper function to format time in "HH:mm A" (e.g., "12:00 PM")
        function formatTime(hour: number): string {
            return moment({ hour }).format("hh:mm A")
        }
    
        // Get the current day and time
        const currentDay = now.format('ddd') // e.g., "Mon", "Tue"
        
        let todayClose: string
        let nextBusDay: string
        let openHour: string
        let closeHour: string
        
        // Determine today's closing time
        if (currentDay === 'Sun') {
            // If it's Sunday, we're closed all day
            return {
                todayClose: 'Closed today',
                nextBusDay: 'on Monday',
                openHour: formatTime(businessHours['Mon'].open),
                closeHour: formatTime(businessHours['Mon'].close),
            }
        }
    
        // If today is a business day, we calculate the closing time
        todayClose = formatTime(businessHours[currentDay].close)
        
        // Find the next business day
        let nextDay = now.clone().add(1, 'day') // Start by checking the next day
        while (!businessHours[nextDay.format('ddd')]) {
            nextDay.add(1, 'day') // Skip weekends or any non-business days
        }
    
        nextBusDay = nextDay.format('ddd') === 'Mon' ? `on ${nextDay.format('dddd')}` : 'tomorrow'
        
        // Determine the opening and closing hours for the next business day
        const nextDayName = nextDay.format('ddd')
        openHour = formatTime(businessHours[nextDayName].open)
        closeHour = formatTime(businessHours[nextDayName].close)
        
        return { todayClose, nextBusDay, openHour, closeHour }
    }

    const busDayDetails = getBusinessDayDetails()

    if (heartworm) {
        label = "HW-Pos"
        quickText = (adoption: IPendingAdoption) => `Hi ${adoption.adopter.firstName},\n\nGreat news! ${adoption.dog} has completed vetting and is ready to head home with you!\n\nWe do want to let you know that ${adoption.dog} has tested positive for heartworms. This is fairly common in the Carolinas and simply means that they were bitten by an infected mosquito. Don't worry—heartworms are not contagious to other pets or humans, and the good news is they're treatable!\n\nWe've attached two documents with details about our heartworm treatment program and your options. You can either work directly with your vet to provide the treatment, or we can take care of it through our foster-to-adopt (FTA) program. If you choose the FTA option, ${adoption.dog} will come back to us for a series of two treatments, and will remain legally owned by us throughout the duration of the treatment period. However, they will go home with you as a foster for the time being and can start becoming acclimated to your home and routine.\n\nOnce you're ready to move forward, we can schedule an appointment to complete the FTA agreement, get you all the materials you'll need, and hand over your new best friend!\n\nWe're ready to complete the pickup anytime today up until ${busDayDetails.todayClose}. We'll also be open ${busDayDetails.nextBusDay} from ${busDayDetails.openHour} to ${busDayDetails.closeHour}. The earlier you can come, the better, as we have lots of adopters coming through. We want to make your adoption process as smooth and quick as possible, so let us know what time works best for you! Just a heads-up: please bring a collar and leash so you can take your new pet home right away!\n\nWe can't wait to get ${adoption.dog} settled into their new home with you. Thanks so much for your patience—it's totally worth the wait!\n\nKind regards,\n${session.userFName} ${session.userLName}\nSaving Grace Animals for Adoption`
    } else {
        label = "HW-Neg"
        quickText = (adoption: IPendingAdoption) => `Hi ${adoption.adopter.firstName},\n\nGreat news! ${adoption.dog} has completed vetting and is ready to head home with you!\n\nIt's in ${adoption.dog}'s best interest to go home as soon as possible, so please try to schedule your pickup within the next 48 hours. If we don't hear from you by then, we'll need to make ${adoption.dog} available to other potential forever families.\n\nWhen you come, please bring your driver's license (so we can make a copy) and a method of payment for the adoption fee of $395. You can pay by cash or credit/debit card, but we can't accept checks or split payments. If you're paying by card, you'll also need your cell phone.\n\nWe're ready to complete the pickup anytime today up until ${busDayDetails.todayClose}. We'll also be open ${busDayDetails.nextBusDay} from ${busDayDetails.openHour} to ${busDayDetails.closeHour}. The earlier you can come, the better, as we have lots of adopters coming through. We want to make your adoption process as smooth and quick as possible, so let us know what time works best for you! Just a heads-up: please bring a collar and leash so you can take your new pet home right away!\n\nWe can't wait to get ${adoption.dog} settled into their new home with you. Thanks so much for your patience—it's totally worth the wait!\n\nKind regards,\n${session.userFName} ${session.userLName}\nSaving Grace Animals for Adoption`
    }
    
    return [
        {
            name: label,
            value: 0,
            text: quickText(adoption)
        }
    ]
}