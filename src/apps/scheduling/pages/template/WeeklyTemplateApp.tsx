import { useEffect, useState } from "react";

import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage";
import { AppointmentForm } from "./components/AppointmentForm";
import { TemplateAppointment } from "./models/TemplateAppointment";
import { CalendarMode, Weekday } from "../../enums/Enums";
import { SimpleTimeslotDictionary, Timeslot, TimeslotDictionary } from "../../components/Timeslot";
import ButtonGroup from "../../../../components/forms/fields/ButtonGroup";
import { useStore } from "zustand";
import { useTemplateHomeState } from "./state/State";

export function WeeklyTemplateApp() {
    // const [timeslots, setTimeslots] = useState<TimeslotDictionary>()
    // const [weekday, setWeekday] = useState<Weekday>(Weekday.MONDAY)
    const store = useStore(useTemplateHomeState)

    // const fetchData = async (weekday: number) => {
    //     setWeekday(weekday)
    //     const blocks: SimpleTimeslotDictionary = await TemplateAppointment.fetchAppointmentsForWeekday(weekday)
    //     setTimeslots(TemplateAppointment.setUpTimeslots(blocks))
    // }

    useEffect(() => {
        store.setWeekday(store.weekday)
    }, [])
    
    return <FullWidthPage
        title="Weekly Template"
    >
        <AppointmentForm />
        <hr />
        <ButtonGroup 
            show={true} 
            value={store.weekday}
            buttons={[
                { name: "Monday", value: Weekday.MONDAY },
                { name: "Tuesday", value: Weekday.TUESDAY },
                { name: "Wednesday", value: Weekday.WEDNESDAY },
                { name: "Thursday", value: Weekday.THURSDAY },
                { name: "Friday", value: Weekday.FRIDAY },
                { name: "Saturday", value: Weekday.SATURDAY },
                { name: "Sunday", value: Weekday.SUNDAY },
            ]} 
            onChange={async (e, value) => {
                store.setWeekday(value)
            }} 
            labelText={""} 
            id={""}
        />
        <div>
            {store.timeslots.map(timeslot => <Timeslot 
                    appointments={timeslot.appointments} 
                    mode={CalendarMode.TEMPLATE} 
                    instant={timeslot.instant} 
                />)}
        </div>
    </FullWidthPage>
}