export enum DogSex {
	FEMALE,
	MALE,
}

export const DogSexLabel: Record<DogSex, string> = {
	[DogSex.FEMALE]: "Female",
	[DogSex.MALE]: "Male",
}

export enum WatchlistSortMethod {
	NAME_ASC,
	NAME_DESC,
	AGE_ASC,
	AGE_DESC,
	SIZE_ASC,
	SIZE_DESC,
	POP_ASC,
	POP_DESC,
}

export const WatchlistSortMethodLabel: Record<WatchlistSortMethod, string> = {
	[WatchlistSortMethod.AGE_ASC]: "Youngest to Oldest",
	[WatchlistSortMethod.AGE_DESC]: "Oldest to Youngest",
	[WatchlistSortMethod.NAME_ASC]: "Name A-to-Z",
	[WatchlistSortMethod.NAME_DESC]: "Name Z-to-A",
	[WatchlistSortMethod.SIZE_ASC]: "Smallest to Largest",
	[WatchlistSortMethod.SIZE_DESC]: "Largest to Smallest",
	[WatchlistSortMethod.POP_ASC]: "Most Watched",
	[WatchlistSortMethod.POP_DESC]: "Least Watched",
}
