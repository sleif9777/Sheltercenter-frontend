import { ChangeLogEntryType } from "../../enums/ChangeLogEnums"

export interface IChangeLogEntry {
	/** ISO date the change shipped, e.g. "2026-10-24" */
	date: string
	type: ChangeLogEntryType
	title: string
	details?: string
}

// Add new entries at the top. Write them for shelter staff, not developers.
export const CHANGE_LOG_ENTRIES: IChangeLogEntry[] = [
	{
		date: "2026-10-27",
		details:
			'Admins and superusers can add short notes about a dog (like "Offsite" or "Trial") from the new Notes tab on the dashboard, for dogs in the system or typed in by name. Notes can be removed by hand or automatically after a chosen day. The tab only appears on the dashboard while there is at least one note.',
		title: "Notes tab on the dashboard",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-27",
		details:
			"Changing the dog on an adoption added from the Chosen Board no longer shows an error. After a change, the dashboard and emails no longer show the previous dog's photo.",
		title: "Change Dog on the Chosen Board works for every adoption",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-24",
		details:
			'Pick the pending adoption from the list, or check "Adoption Not Listed" to type in the dog (and the adopter, if known). The adopter\'s name now shows on the visit card.',
		title: "Visit appointments are linked to pending adoptions",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-24",
		details:
			"Enter the dog's original Saving Grace name, then check \"keeping their new name\" if the family renamed them and that new name will be used at Saving Grace instead. The new name is filed as the dog's name and the original as its FKA.",
		title: "Surrender appointments ask for the dog's original name first",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-24",
		details: "Superusers and admins can review what has changed in the scheduler and when.",
		title: "Added this Change Log page",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-24",
		details: "Double-clicking Book or Cancel no longer sends the request twice.",
		title: "Duplicate bookings and cancellations prevented",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-24",
		details:
			'Click a dog\'s eye icon to hide or show it. Check "Preview as non-admin viewer" at the bottom of the page to see, and screenshot, the list as everyone else sees it.',
		title: "Admins can hide dogs from the Who Went Home and FTA dashboards",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-24",
		title: "Option to skip the chosen-dog email when recording a pending adoption",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-24",
		title: "Ready to Roll dashboard cards show the paperwork appointment",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-24",
		details: "Dates now come from the dog's adoption event in Shelterluv rather than its last update.",
		title: "Who Went Home shows the correct adoption date",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-24",
		title: "Adopters can no longer book less than 2 hours before an appointment",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-17",
		title: "Adopters can choose two dogs in one appointment",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-17",
		title: "Dashboards display more reliably on the Fire TV monitors",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-15",
		title: "Admins can reschedule an adopter's appointment",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-15",
		title: "Send X in Queue emails to a whole day from the calendar",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-15",
		title: "Dashboards auto-scroll and fit the TV screens better",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-15",
		title: "Option to upload adopters without sending approval emails",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-15",
		title: "Calendar appointment cards are color-coded by appointment type",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-15",
		title: "Re-uploading an adopter no longer extends their approval window",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-15",
		title: "Behind-the-scenes upgrades to the server and website tooling",
		type: ChangeLogEntryType.IMPROVEMENT,
	},
	{
		date: "2026-10-03",
		title: "Bookings the server rejected are no longer shown as confirmed",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-01",
		title: "Emails include one-click cancel links and login buttons",
		type: ChangeLogEntryType.FEATURE,
	},
	{
		date: "2026-10-01",
		title: "Visit time slot requests require 3 hours' notice",
		type: ChangeLogEntryType.FIX,
	},
	{
		date: "2026-10-01",
		title: "Calendar restrictions update without the adopter logging in again",
		type: ChangeLogEntryType.FIX,
	},
]
