import { useEffect } from "react";
import { useStore } from "zustand";

import ButtonGroup from "../../../../components/forms/fields/ButtonGroup";
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage";
import { Timeslot } from "../../components/Timeslot";
import { CalendarMode, Weekday } from "../../enums/Enums";
import { AppointmentForm } from "./components/AppointmentForm";
import { useTemplateHomeState } from "./state/State";

export function WeeklyTemplateApp() {
    const store = useStore(useTemplateHomeState)

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
            onChange={async (_, value) => {
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