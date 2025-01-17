import { IQuickText } from "../../../../../messaging/QuickText";
import { IBooking } from "../../models/Booking";

const BaseQuickText = (booking: IBooking, requestedToMeet: string, circumstance: string, signature: string) => `Hi ${booking.adopter.firstName},\n\nWe wanted to check in and let you know that we saw you've requested to meet ${requestedToMeet}.\n\n${circumstance} However, we encourage you to still come to your appointment! There are always wonderful dogs waiting to meet you, and we find that keeping an open mind can lead to some amazing connections. Plus, we often have dogs who haven't had a chance to have their photos taken yet and aren't on our website, so you may meet someone unexpected.\n\nLooking forward to seeing you!\n\nKind regards,\n${signature}\nSaving Grace Animals for Adoption`

export function AppointmentCardQuickTexts(booking: IBooking, signature: string = "The Adoptions Team"): IQuickText[] {
    return [
        {
            name: "Limited Puppies",
            value: 0,
            text: BaseQuickText(
                booking,
                "puppies",
                "Right now, we're a bit limited on available puppies.",
                signature
            )
        },
        {
            name: "Limited Small Puppies",
            value: 1,
            text: BaseQuickText(
                booking,
                "small puppies",
                "Right now, we're a bit limited on available small puppies.",
                signature
            )
        },
        {
            name: "Limited Hypo",
            value: 2,
            text: BaseQuickText(
                booking,
                "low-allergy dogs",
                "Right now, we're a bit limited on available low-allergy dogs.",
                signature
            )
        },
        {
            name: "Limited Fun-Size",
            value: 3,
            text: BaseQuickText(
                booking,
                "fun-size (under 20 lbs) dogs",
                "Right now, we're a bit limited on fun-size dogs.",
                signature
            )
        },
        {
            name: "Dogs Were Adopted",
            value: 4,
            text: BaseQuickText(
                booking,
                "DOG NAME HERE",
                "DOG NAME HERE is/are no longer available for adoption.",
                signature
            )
        },
        {
            name: "Dogs Not Here Yet",
            value: 5,
            text: BaseQuickText(
                booking,
                "DOG NAME HERE",
                "DOG NAME HERE will not be available to meet on the day of your appointment. They will be available on DATE HERE.",
                signature
            )
        },
    ]
}