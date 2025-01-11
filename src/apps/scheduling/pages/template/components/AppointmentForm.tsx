import ModalWithButton from "../../../../../components/modals/ModalWithButton"
import { AppointmentType, PaperworkAppointmentSubtype, Weekday } from "../../../enums/Enums"
import { useState } from "react"
import { ITemplateAppointment, TemplateAppointment } from "../models/TemplateAppointment"
import ButtonGroup from "../../../../../components/forms/fields/ButtonGroup"
import { TimeField } from "../../../../../components/forms/fields/TimeField"
import { TemplateAppointmentsAPI } from "../api/API"
import { useStore } from "zustand"
import { useTemplateHomeState } from "../state/State"

interface AppointmentFormProps {
    defaults?: ITemplateAppointment,
    extendOnSubmit?: () => any,
}

export function AppointmentForm(props: AppointmentFormProps) {
    const { defaults, extendOnSubmit } = props
    const store = useStore(useTemplateHomeState)

    const [type, setType] = useState<AppointmentType | undefined>(defaults?.type)
    const [time, setTime] = useState<Date | undefined>(defaults?.time)
    const [weekday, setWeekday] = useState<Weekday | undefined>()

    const resetForm = () => {
        setType(defaults?.type)
        setTime(defaults?.time)
        setWeekday(undefined)
    }

    const validate = () => {
        return type != undefined &&
            time != undefined &&
            weekday != undefined
    }

    const handleSubmit = async () => {
        validate()

        if (weekday === undefined) {
            return
        }

        const data: Omit<ITemplateAppointment, "instant"> = {
            weekday: weekday,
            time: time!,
            type: type!,
        }

        await new TemplateAppointmentsAPI().CreateTemplateAppointment(data)

        store.setWeekday(weekday)

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    return <ModalWithButton 
        buttonClass={"submit-button"} 
        buttonId={""} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => resetForm()}
        launchBtnLabel={"Add Appointment"} 
        modalTitle={"Add Appointment"}
    >
        <div className="form-content">
            <ButtonGroup
                id={"weekday"}
                show={true}
                labelText="Weekday" 
                value={weekday}
                onChange={(e, newWeekday) => setWeekday(newWeekday)}
                buttons={[
                    { name: "Monday", value: Weekday.MONDAY },
                    { name: "Tuesday", value: Weekday.TUESDAY },
                    { name: "Wednesday", value: Weekday.WEDNESDAY },
                    { name: "Thursday", value: Weekday.THURSDAY },
                    { name: "Friday", value: Weekday.FRIDAY },
                    { name: "Saturday", value: Weekday.SATURDAY },
                    { name: "Sunday", value: Weekday.SUNDAY }
                ]}
            />
            <ButtonGroup
                id={"type"}
                show={true}
                labelText="Type" 
                value={type}
                onChange={(e, newType) => {
                    setType(newType)
                }}
                buttons={[
                    { name: "Adults", value: AppointmentType.ADULTS },
                    { name: "Puppies", value: AppointmentType.PUPPIES },
                    { name: "All Ages", value: AppointmentType.ALL_AGES },
                    { name: "Fun-Size", value: AppointmentType.FUN_SIZE },
                    { name: "Surrender", value: AppointmentType.SURRENDER },
                    { name: "Paperwork", value: AppointmentType.PAPERWORK },
                    { name: "Visit", value: AppointmentType.VISIT },
                    { name: "Donation Drop-Off", value: AppointmentType.DONATION_DROP_OFF }
                ]}
            />
            <TimeField 
                id={"time"} 
                labelText="Time" 
                changeTime={(e) => setTime(e ?? undefined)} 
                defaultValue={time}
            />
        </div>
    </ModalWithButton>
}