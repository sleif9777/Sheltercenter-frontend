export enum BookingMessageTemplate {
	LIMITED_PUPPIES = 0,
	LIMITED_SMALL_PUPPIES = 1,
	LIMITED_HYPO = 2,
	LIMITED_FUN_SIZE = 3,
	DOGS_WERE_ADOPTED = 4,
	DOGS_NOT_HERE_YET = 5,
	X_IN_QUEUE = 6,
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
