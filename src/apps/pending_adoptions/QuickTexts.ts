import { IQuickText } from "../messaging/QuickText";
import { IPendingAdoption } from "./models/PendingAdoption";

const BaseQuickText = (symptom: string, adoption: IPendingAdoption) => `Hi ${adoption.adopter.firstName},\n\nJust a quick update on ${adoption.dog}! They had a vet visit today and, unfortunately, they've got ${symptom} — a common sign of an upper respiratory infection. Not the best news, but the good news is we've got them on new meds, and they'll be seeing the vet again next week for a follow-up.\n\nKind regards,\nThe Adoptions Team\nSaving Grace Animals for Adoption`

export function ChosenBoardQuickTexts(adoption: IPendingAdoption): IQuickText[] {
    return [
        {
            name: "Cough",
            value: 0,
            text: BaseQuickText("a cough", adoption)
        },
        {
            name: "Nasal Discharge",
            value: 1,
            text: BaseQuickText("some nasal discharge", adoption)
        }
    ]
} 