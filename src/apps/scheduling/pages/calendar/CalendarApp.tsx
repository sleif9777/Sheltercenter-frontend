import { useEffect, useState } from "react"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import { ToolbarButton, ToolbarLink, ToolbarModal } from "../../../../layouts/Toolbar/Toolbar"
import { DateTimeStrings } from "../../../../utils/DateAndTimeStrings"
import { AppointmentsAPI } from "./api/AppointmentsAPI"
import { Timeslot } from "../../components/Timeslot"
import { CalendarMode, Weekday } from "../../enums/Enums"
import { useSchedulingHomeState } from "./state/State"
import { SchedulingHomeTitle } from "./components/SchedulingHomeTitle"
import { useStore } from "zustand"
import { DateField } from "../../../../components/forms/fields/DateField"
import PlaceholderText from "../../../../layouts/PlaceholderText/PlaceholderText"
import { faPaw, faShieldDog, faShopLock } from "@fortawesome/free-solid-svg-icons"
import { ClosedDatesAPI } from "./api/ClosedDatesAPI"
import { AppointmentForm } from "./forms/appointment/AppointmentForm"
import { EmptyDatesAlert } from "./components/alerts/EmptyDatesAlert"
import moment from "moment"
import { MissingOutcomesAlert } from "./components/alerts/MissingOutcomesAlert"
import { useSessionState } from "../../../../session/SessionState"
import { SecurityLevel } from "../../../../session/SecurityLevel"
import { AppointmentCard } from "./components/card/AppointmentCard"
import { Appointment } from "./models/Appointment"
import { AreYouSure } from "../../../../components/modals/AreYouSure"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function CalendarApp() {
    const store = useStore(useSchedulingHomeState)
    const weekday = DateTimeStrings.getWeekday(store.weekday).toLocaleUpperCase()
    const session = useStore(useSessionState)

    // Render the component
    useEffect(() => {
        var dataToLoad: ("adopters" | "adoptions")[]

        if (session.adopterUser) {
            dataToLoad = []
        } else if (session.greeterUser) {
            dataToLoad = ["adopters"]
        } else {
            dataToLoad = ["adopters", "adoptions"]
        }

        store.refresh(store.viewDate, dataToLoad, session.userID!)
    }, [])

    if (session.userID == undefined) { return <></> }

    function CopyFromTemplateButton() {
        return <button 
            className="large-button" 
            onClick={async () => {
                await new AppointmentsAPI().CreateBatchForDate(store.viewDate)
                store.refresh(store.viewDate, [], session.userID!)
            }}
        >
            Copy from {weekday} Template
        </button>
    }

    function MarkAsClosedDateButton() {
        return <button 
            className="large-button" 
            onClick={async () => {
                await new ClosedDatesAPI().MarkDateAsClosed(store.viewDate)
                store.refresh(store.viewDate, [], session.userID!)
            }}
        >
            Mark Date as Closed
        </button>
    }

    function AddAppointmentButton() {
        return <AppointmentForm buttonClassOverride="large-button"/>
    }

    function UndoMarkClosedButton() {
        return <button 
            className="large-button" 
            onClick={async () => {
                if (!store.closedDateID) {
                    return
                }

                await new ClosedDatesAPI().delete(store.closedDateID)
                store.refresh(store.viewDate, [], session.userID!)
            }}
        >
            Undo Closed Date
        </button>
    }

    const alerts = () => {
        switch (session.securityLevel) {
            case SecurityLevel.ADOPTER:
                if (store.userCurrentAppointment) {
                    return [<AppointmentCard 
                        appointment={new Appointment(store.userCurrentAppointment)} 
                        context="Current Appointment"
                    />]
                }
                return []
            case SecurityLevel.GREETER:
                return [] // TODO: Short notices, internal notes
            case SecurityLevel.ADMIN:
            case SecurityLevel.SUPERUSER:
                return [
                    <EmptyDatesAlert emptyDates={store.emptyDates} />,
                    <MissingOutcomesAlert />
                ]
            default:
                return []
        }
    }

    const getContent = () => {
        if (session.securityLevel == undefined) {
            return <></>
        }

        if (store.weekday == Weekday.SUNDAY) {
            return <PlaceholderText iconDef={faShopLock} text={"Sundays are closed by default."} />
        } 
        
        if (store.closedDateID) {
            return <>
                <PlaceholderText iconDef={faShopLock} text={"Saving Grace will be closed on this date."} />
                {
                    session.securityLevel > SecurityLevel.GREETER
                        ? <UndoMarkClosedButton />
                        : null
                }
            </>
        }

        if (session.securityLevel == SecurityLevel.ADOPTER && 
            (moment(store.viewDate).diff(moment(new Date), 'days') + 1) > 14) {
                return <PlaceholderText iconDef={faShieldDog} text={"Appointments will be open for booking two weeks in advance."} />
        }

        if (store.timeslots.length === 0) {
            if (session.securityLevel > SecurityLevel.GREETER) {
                return <>
                    <CopyFromTemplateButton /><br />
                    <AddAppointmentButton /><br />
                    <MarkAsClosedDateButton />
                </>
            } else {
                return <PlaceholderText iconDef={faShieldDog} text={"No appointments published for this date."} />
            }
        }

        return <>
            <AppointmentForm />
            {store.timeslots.map(timeslot => <Timeslot 
                appointments={timeslot.appointments} 
                mode={CalendarMode.SCHEDULING} 
                instant={timeslot.instant} 
            />)}
        </>
    }


    const toolbarItems = () => {
        const base = [
            ReturnToTodayButton(),
            JumpToDateModal(),
        ]

        if (session.securityLevel && session.securityLevel > SecurityLevel.ADOPTER) {
            base.push(DailyReportButton(), PrintViewButton())
        }

        if (session.securityLevel && session.securityLevel > SecurityLevel.GREETER) {
            base.push(LockAllButton(), UnlockAllButton())
        }

        return base
    }
    
    return <FullWidthPage 
        subtitle={weekday}
        title={<SchedulingHomeTitle />} 
        toolbarItems={toolbarItems()}  
    >
        <ul style={{columnCount: alerts().length}}>
            {alerts().map(a => <li>{a}</li>)}
        </ul>
        {getContent()}
    </FullWidthPage>
}

////// DATA HOOKS //////
async function toggleLockForAll(isUnlock: boolean, forDate: Date) {
    return await new AppointmentsAPI().ToggleLockForAll(isUnlock, forDate)
}

////// TOOLBAR COMPONENTS //////
function ReturnToTodayButton() {
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const handleSubmit = async () => {
        store.refresh(new Date(), [], session.userID!)
    }

    return <ToolbarButton
        text="Return to Today"
        onClick={() => handleSubmit()}
    />
}

function JumpToDateModal() {
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)
    const resetForm = () => {
        setJumpToDateValue(new Date())
    }

    const [jumpToDateValue, setJumpToDateValue] = useState<Date>(new Date())

    return <ToolbarModal
        text="Jump to Date"
        canSubmit={() => jumpToDateValue != undefined}
        extendOnSubmit={async () => {
            store.refresh(jumpToDateValue, [], session.userID!)
        }}
        extendOnClose={resetForm}
        modalTitle={"Jump to Date"}
    >
        <div className="form-content">
            <DateField 
                id="jumpToDate"
                labelText="Date"
                placeholder={jumpToDateValue}
                changeDate={(e: Date | null) => setJumpToDateValue(e ?? new Date())}
            />
        </div>
    </ToolbarModal>
}

function DailyReportButton() {
    const store = useStore(useSchedulingHomeState)

    return <ToolbarLink 
        href={"/daily_report/" + moment(store.viewDate).format("yyyy-MM-DD")}
        text="Daily Report"
    />
}

function PrintViewButton() {
    const store = useStore(useSchedulingHomeState)

    return <ToolbarLink 
        href={"/print_view/" + moment(store.viewDate).format("yyyy-MM-DD")}
        text="Print View"
    />
}

function LockAllButton() {
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    return <>
        <AreYouSure 
            extendOnSubmit={async () => {
                await toggleLockForAll(false, store.viewDate)
                store.refresh(store.viewDate, [], session.userID!)
            }}
            youWantTo="lock all appointments for this date"
            submitBtnLabel={"Yes"}
            buttonClass={`lock-all-appointments toolbar-element`}
            buttonId={`lock-all-appointments`}
            launchBtnLabel={<><FontAwesomeIcon icon={faPaw} /> Lock All</>}
            cancelBtnLabel="Go Back"
            modalTitle="Lock All Appointments"
        />
    </>
}

function UnlockAllButton() {
    const store = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    return <>
        <AreYouSure 
            extendOnSubmit={async () => {
                await toggleLockForAll(true, store.viewDate)
                store.refresh(store.viewDate, [], session.userID!)
            }}
            youWantTo="unlock all appointments for this date"
            submitBtnLabel={"Yes"}
            buttonClass={`unlock-all-appointments toolbar-element`}
            buttonId={`unlock-all-appointments`}
            launchBtnLabel={<><FontAwesomeIcon icon={faPaw} /> Unlock All</>}
            cancelBtnLabel="Go Back"
            modalTitle="Unlock All Appointments"
        />
    </>
}