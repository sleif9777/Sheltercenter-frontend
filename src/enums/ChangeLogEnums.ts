export enum ChangeLogEntryType {
	FEATURE,
	IMPROVEMENT,
	FIX,
}

export const ChangeLogEntryTypeLabel: Record<ChangeLogEntryType, string> = {
	[ChangeLogEntryType.FEATURE]: "New",
	[ChangeLogEntryType.IMPROVEMENT]: "Improved",
	[ChangeLogEntryType.FIX]: "Fix",
}
