export enum BookingMessageTemplate {
	LIMITED_PUPPIES = 1,
	LIMITED_SMALL_PUPPIES = 2,
	LIMITED_HYPO = 3,
	LIMITED_FUN_SIZE = 4,
	DOGS_WERE_ADOPTED = 5,
	DOGS_NOT_HERE_YET = 6,
	X_IN_QUEUE = 7,
}

export const BookingMessageTemplateLabel: Record<BookingMessageTemplate, string> = {
	[BookingMessageTemplate.LIMITED_PUPPIES]: "Limited Puppies",
	[BookingMessageTemplate.LIMITED_SMALL_PUPPIES]: "Limited Small Puppies",
	[BookingMessageTemplate.LIMITED_HYPO]: "Limited Hypo",
	[BookingMessageTemplate.LIMITED_FUN_SIZE]: "Limited Fun Size",
	[BookingMessageTemplate.DOGS_WERE_ADOPTED]: "Dogs Were Adopted",
	[BookingMessageTemplate.DOGS_NOT_HERE_YET]: "Dogs Not Here Yet",
	[BookingMessageTemplate.X_IN_QUEUE]: "X In Queue",
}
