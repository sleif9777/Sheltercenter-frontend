import { ValueLabelPair } from "../core/components/formInputs/SelectInput"

/**
 * Expected container format for timeslots.
 *
 *  Format for Appointment: [
 *      {
 *          key: 1330,
 *          label: "1:30 PM",
 *          value: [
 *              { ID: 72, hasCurrentBooking: false },
 *              { ID: 73, hasCurrentBooking: true },
 *              { ID: 89, hasCurrentBooking: false },
 *              ...
 *          ],
 *      },
 *      ...
 *  ]
 *
 *  Format for AppointmentBase: [
 *      {
 *          key: 1500,
 *          label: "3:00 PM",
 *          value: [
 *              { ID: 19, type: 2 },
 *              { ID: 25, type: 6 },
 *              ...
 *          ],
 *      },
 *      ...
 *  ]
 */
type IDOnly = {
	ID: number
}

export type ScheduleHash<T extends IDOnly> = ValueLabelPair<T[]> & { key: number }
