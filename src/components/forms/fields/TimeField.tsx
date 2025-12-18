import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import moment from "moment-timezone"
import { FieldProps } from "./FieldProps"

interface TimeFieldProps extends FieldProps {
    changeTime: (date: Date | null) => void
    defaultValue?: Date
}

export function TimeField(props: TimeFieldProps) {
    const { id, labelText, changeTime, defaultValue } = props
    moment.tz.setDefault("America/New_York")

    const time = moment(defaultValue) ?? undefined

    return <>
        <label className="modal-form" htmlFor={id}>{labelText}</label>
        <LocalizationProvider dateAdapter={AdapterMoment} dateLibInstance={moment}>
            <TimePicker 
                // defaultValue={time.clone()}
                onChange={(value) => {
                    if (value === null) {
                        changeTime(null)
                        return
                    }

                    time.set("hour", value.get("hour"))
                    time.set("minute", value.get("minute"))
                    time.set("second", 0)
                    time.set("millisecond", 0)

                    changeTime(time.toDate())
                }}
                minutesStep={15}
                timezone="America/New_York"
            />
        </LocalizationProvider>
    </>
}