export type ChangeLogEntryType = "feature" | "fix" | "improvement"

export interface ChangeLogEntry {
	/** ISO date the change shipped, e.g. "2026-10-24" */
	date: string
	type: ChangeLogEntryType
	title: string
	details?: string
}

// Add new entries at the top. Write them for shelter staff, not developers.
export const CHANGE_LOG_ENTRIES: ChangeLogEntry[] = [
	{
		date: "2026-10-24",
		details:
			"Enter the dog's original Saving Grace name, then check \"keeping their new name\" if the family renamed them. The new name is filed as the dog's name and the original as its FKA.",
		title: "Surrender appointments ask for the dog's original name first",
		type: "feature",
	},
	{
		date: "2026-10-24",
		details: "Superusers can review what has changed in the scheduler and when.",
		title: "Added this Change Log page",
		type: "feature",
	},
	{
		date: "2026-10-24",
		details: "Approval and re-approval now immediately restore an adopter's ability to book.",
		title: "Adopter calendar access stays current",
		type: "fix",
	},
	{
		date: "2026-10-24",
		details: "Uploading and approving adopters is limited to admin accounts.",
		title: "Only admins can upload or approve adopters",
		type: "fix",
	},
	{
		date: "2026-10-24",
		details: "Double-clicking Book or Cancel no longer sends the request twice.",
		title: "Duplicate bookings and cancellations prevented",
		type: "fix",
	},
	{
		date: "2026-10-24",
		title: "Admins can hide dogs from the Who Went Home and FTA dashboards",
		type: "feature",
	},
	{
		date: "2026-10-24",
		title: "Option to skip the chosen-dog email when recording a pending adoption",
		type: "feature",
	},
	{
		date: "2026-10-24",
		title: "Ready to Roll dashboard cards show the paperwork appointment",
		type: "feature",
	},
	{
		date: "2026-10-24",
		details: "Dates now come from the dog's adoption event in Shelterluv rather than its last update.",
		title: "Who Went Home shows the correct adoption date",
		type: "fix",
	},
	{
		date: "2026-10-24",
		title: "Adopters can no longer book less than 2 hours before an appointment",
		type: "fix",
	},
	{
		date: "2026-10-17",
		title: "Adopters can choose two dogs in one appointment",
		type: "feature",
	},
	{
		date: "2026-10-17",
		title: "Dashboards display more reliably on the Fire TV monitors",
		type: "fix",
	},
	{
		date: "2026-10-15",
		title: "Admins can reschedule an adopter's appointment",
		type: "feature",
	},
	{
		date: "2026-10-15",
		title: "Send X in Queue emails to a whole day from the calendar",
		type: "feature",
	},
	{
		date: "2026-10-15",
		title: "Dashboards auto-scroll and fit the TV screens better",
		type: "feature",
	},
	{
		date: "2026-10-15",
		title: "Option to upload adopters without sending approval emails",
		type: "feature",
	},
	{
		date: "2026-10-15",
		title: "Calendar appointment cards are color-coded by appointment type",
		type: "feature",
	},
	{
		date: "2026-10-15",
		title: "Re-uploading an adopter no longer extends their approval window",
		type: "fix",
	},
	{
		date: "2026-10-15",
		title: "Behind-the-scenes upgrades to the server and website tooling",
		type: "improvement",
	},
	{
		date: "2026-10-03",
		title: "Bookings the server rejected are no longer shown as confirmed",
		type: "fix",
	},
	{
		date: "2026-10-01",
		title: "Emails include one-click cancel links and login buttons",
		type: "feature",
	},
	{
		date: "2026-10-01",
		title: "Visit time slot requests require 3 hours' notice",
		type: "fix",
	},
	{
		date: "2026-10-01",
		title: "Calendar restrictions update without the adopter logging in again",
		type: "fix",
	},
]
