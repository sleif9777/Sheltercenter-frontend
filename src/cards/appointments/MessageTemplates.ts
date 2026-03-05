import ReactQuill from "react-quill"

import { BookingMessageTemplate, BookingMessageTemplateLabel } from "../../enums/BookingEnums"
import { QuickText } from "../../forms/users/MessageForm"
import { BookingAdopter } from "../../models/AdopterModels"

export function getBaseQuickText(
	adopter: BookingAdopter,
	templateFlag: BookingMessageTemplate,
	requestedToMeet: string,
	circumstance: string,
	signature?: string
): QuickText {
	return {
		label: BookingMessageTemplateLabel[templateFlag],
		templateContent: getBaseQuickTextContent(adopter, requestedToMeet, circumstance, signature),
		value: templateFlag,
	}
}

export function getBaseQuickTextContent(
	adopter: BookingAdopter,
	requestedToMeet: string,
	circumstance: string,
	signature?: string
): ReactQuill.Value {
	const finalSignature = signature || "The Adoptions Team"

	return {
		ops: [
			// Greeting in pink
			{ attributes: { color: "#a7396e" }, insert: `Hi ${adopter.demographics.firstName},` },
			{ insert: "\n\n" },

			// Main body
			{ insert: `We wanted to check in and let you know that we saw you've requested to meet ` },
			{ attributes: { bold: true }, insert: requestedToMeet },
			{ insert: ".\n\n" },

			{ insert: circumstance },
			{
				insert:
					" However, we encourage you to still come to your appointment! There are always wonderful dogs waiting to meet you, and we find that keeping an open mind can lead to some amazing connections. Plus, we often have dogs who haven't had a chance to have their photos taken yet and aren't on our website, so you may meet someone unexpected.\n\n",
			},

			// Closing in teal
			{ attributes: { color: "#1e6c80" }, insert: "Looking forward to seeing you!" },
			{ insert: "\n\n" },

			// Sign-off in teal
			{ attributes: { color: "#1e6c80" }, insert: "Kind regards," },
			{ insert: "\n" },

			// Signature in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: finalSignature },
			{ insert: "\n" },

			// Organization name in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: "Saving Grace Animals for Adoption" },
		],
	} as ReactQuill.Value
}

export function getXInQueueContent(adopter: BookingAdopter, signature?: string): ReactQuill.Value {
	const finalSignature = signature || "The Adoptions Team"

	return {
		ops: [
			// Greeting in pink
			{ attributes: { color: "#a7396e" }, insert: `Hi ${adopter.demographics.firstName},` },
			{ insert: "\n\n" },

			// Main body
			{
				insert:
					"We are excited to welcome you to the Funny Farm tomorrow! We're incredibly fortunate to have so many families coming to meet our available dogs. Since our schedule is currently full, we want to ensure all visitors know their place in the queue to avoid any surprises upon arrival.\n\n",
			},

			{
				insert:
					"With high demand for adoptions this week, we must follow the original appointment times scheduled through our system. You are ",
			},
			{ attributes: { bold: true }, insert: "#$$$NUMBER$$$" },
			{ insert: " in the queue to meet " },
			{ attributes: { bold: true }, insert: "$$$DOG NAME HERE$$$" },
			{
				insert:
					" tomorrow and will be assisted by a counselor as soon as possible. Please be mindful of time, as other visitors are also eager to meet their potential new companions.\n\n",
			},

			// Closing in teal
			{ attributes: { color: "#1e6c80" }, insert: "We look forward to seeing you!" },
			{ insert: "\n\n" },

			// Sign-off in teal
			{ attributes: { color: "#1e6c80" }, insert: "Kind regards," },
			{ insert: "\n" },

			// Signature in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: finalSignature },
			{ insert: "\n" },

			// Organization name in teal and bold
			{ attributes: { bold: true, color: "#1e6c80" }, insert: "Saving Grace Animals for Adoption" },
		],
	} as ReactQuill.Value
}

export function createQuickTexts(adopter: BookingAdopter, signature?: string): QuickText[] {
	const sig = signature || "The Adoptions Team"

	return [
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.LIMITED_PUPPIES,
			"puppies",
			"Right now, we're a bit limited on available puppies.",
			sig
		),
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.LIMITED_SMALL_PUPPIES,
			"small puppies",
			"Right now, we're a bit limited on available small puppies.",
			sig
		),
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.LIMITED_HYPO,
			"low-allergy dogs",
			"Right now, we're a bit limited on available low-allergy dogs.",
			sig
		),
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.LIMITED_FUN_SIZE,
			"fun-size (under 20 lbs.) dogs",
			"Right now, we're a bit limited on fun-size dogs. Dogs in this size category are only available to meet on Fridays and Saturdays. ",
			sig
		),
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.DOGS_WERE_ADOPTED,
			"$$$DOG NAME HERE$$$",
			"$$$DOG NAME HERE$$$ is/are no longer available for adoption.",
			sig
		),
		getBaseQuickText(
			adopter,
			BookingMessageTemplate.DOGS_NOT_HERE_YET,
			"$$$DOG NAME HERE$$$",
			"$$$DOG NAME HERE$$$ will not be available to meet on the day of your appointment. They will be available on $$$DATE$$$.",
			sig
		),
		{
			label: BookingMessageTemplateLabel[BookingMessageTemplate.X_IN_QUEUE],
			templateContent: getXInQueueContent(adopter, sig),
			value: BookingMessageTemplate.X_IN_QUEUE,
		},
	]
}
