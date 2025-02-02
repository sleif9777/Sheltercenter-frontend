import { faPaw, faShieldDog, faShopLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import moment from "moment"
import { useEffect, useState } from "react"
import { useStore } from "zustand"

import { DateField } from "../../../../components/forms/fields/DateField"
import { AreYouSure } from "../../../../components/modals/AreYouSure"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../../../layouts/PlaceholderText/PlaceholderText"
import { ToolbarButton, ToolbarLink, ToolbarModal } from "../../../../layouts/Toolbar/Toolbar"
import { SecurityLevel } from "../../../../session/SecurityLevel"
import { useSessionState } from "../../../../session/SessionState"
import { DateTime } from "../../../../utils/DateTimeUtils"
import { fullyBookedDay, Timeslot } from "../../components/Timeslot"
import { CalendarMode, Weekday } from "../../enums/Enums"
import { AppointmentsAPI } from "./api/AppointmentsAPI"
import { ClosedDatesAPI } from "./api/ClosedDatesAPI"
import { EmptyDatesAlert } from "./components/alerts/EmptyDatesAlert"
import { MissingOutcomesAlert } from "./components/alerts/MissingOutcomesAlert"
import { AppointmentCard } from "./components/card/AppointmentCard"
import { SchedulingHomeTitle } from "./components/SchedulingHomeTitle"
import { AppointmentForm } from "./forms/appointment/AppointmentForm"
import { useSchedulingHomeState } from "./state/State"
import { JumpToTimeslots } from "./components/alerts/JumpToTimeslots"
import { AdopterFlagsAlert } from "./components/alerts/AdopterFlagsAlert"
import { Collapsible } from "../../../../components/collapsible/Collapsible"
import { LoadingPlaceholder } from "../../../../layouts/PlaceholderText/LoadingPlaceholder"

export default function CalendarApp() {
    const schedule = useStore(useSchedulingHomeState)
    const session = useStore(useSessionState)

    const weekday = new DateTime(schedule.viewDate).GetWeekday().toLocaleUpperCase()

    useEffect(() => {
        var dataToLoad: ("adopters" | "adoptions")[]

        if (session.adopterUser) {
            dataToLoad = []
        } else if (session.greeterUser) {
            dataToLoad = ["adopters"]
        } else {
            dataToLoad = ["adopters", "adoptions"]
        }
        
        schedule.refresh(schedule.viewDate, dataToLoad, session.userID!)
    }, [])

    // TOOLBAR
    function GetToolbar() {
        const base = [
            <ReturnToTodayButton />,
            <JumpToDateModal />,
        ]

        if (session.securityLevel && session.securityLevel > SecurityLevel.ADOPTER) {
            base.push(<DailyReportButton />, <PrintViewButton />)
        }

        if (session.securityLevel && session.securityLevel > SecurityLevel.GREETER) {
            base.push(<LockAllButton />, <UnlockAllButton />)
        }

        return base
    }

    function ReturnToTodayButton() {
        const handleSubmit = async () => {
            schedule.refresh(new Date(), [], session.userID!)
        }

        return <ToolbarButton
            text="Return to Today"
            onClick={() => handleSubmit()}
        />
    }

    function JumpToDateModal() {
        const resetForm = () => {
            setJumpToDateValue(new Date())
        }

        const [jumpToDateValue, setJumpToDateValue] = useState<Date>(new Date())

        return <ToolbarModal
            text="Jump to Date"
            height="30%"
            canSubmit={() => jumpToDateValue != undefined}
            extendOnSubmit={async () => {
                schedule.refresh(jumpToDateValue, [], session.userID!)
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
        return <ToolbarLink 
            href={"/daily_report/" + new DateTime(schedule.viewDate).Format("yyyy-MM-DD")}
            text="Daily Report"
        />
    }

    function PrintViewButton() {
        return <ToolbarLink 
            href={"/print_view/" + new DateTime(schedule.viewDate).Format("yyyy-MM-DD")}
            text="Print View"
        />
    }

    function LockAllButton() {
        return <>
            <AreYouSure 
                extendOnSubmit={async () => {
                    await toggleLockForAll(false, schedule.viewDate)
                    schedule.refresh(schedule.viewDate, [], session.userID!)
                }}
                youWantTo="lock all appointments for this date"
                submitBtnLabel="Yes"
                buttonClass={`lock-all-appointments toolbar-element`}
                buttonId={`lock-all-appointments`}
                launchBtnLabel={<><FontAwesomeIcon icon={faPaw} /> Lock All</>}
                cancelBtnLabel="Go Back"
                modalTitle="Lock All Appointments"
            />
        </>
    }

    function UnlockAllButton() {
        return <>
            <AreYouSure 
                extendOnSubmit={async () => {
                    await toggleLockForAll(true, schedule.viewDate)
                    schedule.refresh(schedule.viewDate, [], session.userID!)
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

    // LARGE ACTION BUTTONS
    function CopyFromTemplateButton() {
        return <button 
            className="large-button" 
            onClick={async () => {
                await new AppointmentsAPI().CreateBatchForDate(schedule.viewDate)
                schedule.refresh(schedule.viewDate, [], session.userID!)
            }}
        >
            Copy from {weekday} Template
        </button>
    }

    function MarkAsClosedDateButton() {
        return <button 
            className="large-button" 
            onClick={async () => {
                await new ClosedDatesAPI().MarkDateAsClosed(schedule.viewDate)
                schedule.refresh(schedule.viewDate, [], session.userID!)
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
                if (!schedule.closedDateID) {
                    return
                }

                await new ClosedDatesAPI().delete(schedule.closedDateID)
                schedule.refresh(schedule.viewDate, [], session.userID!)
            }}
        >
            Undo Closed Date
        </button>
    }

    // ALERTS
    function CalendarAppAlerts() {        
        if (session.securityUndefined) {
            return <></>
        }

        if (!session.securityLevel) { // No security OR adopter security
            console.log(schedule)
            return <div className="desktop-only">
                {schedule.userCurrentAppointment && <AppointmentCard 
                    data={schedule.userCurrentAppointment}
                    context="Current Appointment"
                />}
            </div>
        }

        // Build the alerts list
        var alerts = []

        switch (session.securityLevel) {
            case SecurityLevel.GREETER:
                alerts.push(<JumpToTimeslots />)
                break
            case SecurityLevel.ADMIN:
            case SecurityLevel.SUPERUSER:
                alerts.push(<EmptyDatesAlert />)
                alerts.push(<MissingOutcomesAlert />)
                alerts.push(<JumpToTimeslots />)
                alerts.push(<AdopterFlagsAlert />)
                break
        }

        return <>
            <Collapsible 
                items={alerts} 
                buttonLabel="Show Alerts" 
                disableButton={
                    schedule.currentlyRefreshingAppointments || 
                    schedule.currentlyRefreshingAdoptions || 
                    schedule.currentlyRefreshingAdopters
                }
                className="mobile-only"
            />
            <div className="desktop-only">
                <ul style={{ columnCount: 3 }}>
                    {alerts.map(a => <li>{a}</li>)}
                </ul>
            </div>
        </>
    }

    function CalendarAppContent() {
        if (session.securityLevel == undefined) {
            return <></>
        }

        if (schedule.weekday == Weekday.SUNDAY) {
            return <PlaceholderText iconDef={faShopLock} text={"Sundays are closed by default."} />
        }

        if (schedule.currentlyRefreshingAppointments) {
            return <LoadingPlaceholder what="appointments" />
        }

        if (schedule.closedDateID) {
            return <>
                <PlaceholderText iconDef={faShopLock} text={"Saving Grace will be closed on this date."} />
                {session.securityLevel > SecurityLevel.GREETER && <UndoMarkClosedButton />}
            </>
        }

        if (session.adopterUser) {
            // USER HAS A COMPLETED OR PENDING ADOPTION
            if (schedule.userExceptions.length > 0) {
                return <>
                    <PlaceholderText iconDef={faShieldDog} text={"Congrats on your adoption!"} />
                    <p>
                        If you need further assistance, email adoptions@savinggracenc.org.
                    </p>
                </>
            }

            // DATE IS IN THE PAST OR FURTHER THAN TWO WEEKS OUT
            const difference = moment(schedule.viewDate).diff(moment(), 'days') + 1
            const dateOutsideBookingAllowance = difference < 1 || difference > 14
            
            if (dateOutsideBookingAllowance) {
                return <PlaceholderText 
                    iconDef={faShieldDog} 
                    text={difference > 14 
                        ? "Appointments will be open for booking two weeks in advance." 
                        : "This date is in the past."} 
                />
            }

            const adopterBookedOnThisDay = schedule.userCurrentAppointment &&
                DateTime.IsSameDate(new DateTime(schedule.viewDate), new DateTime(schedule.userCurrentAppointment.instant))

            if (!adopterBookedOnThisDay && fullyBookedDay(schedule.timeslots, session.userID)) {
                return <PlaceholderText 
                    iconDef={faShieldDog} 
                    text={"All appointments on this date are booked."} 
                />
            }
        }
        
        if (schedule.timeslots.length === 0) {
            return <>
                {session.securityLevel >= SecurityLevel.ADMIN && <>
                    <CopyFromTemplateButton /><br />
                    <AddAppointmentButton /><br />
                    <MarkAsClosedDateButton />
                </>}
                {session.securityLevel < SecurityLevel.ADMIN && <PlaceholderText 
                    iconDef={faShieldDog} 
                    text={"No appointments published for this date."} 
                />}
            </>
        }

        return <>
            <AppointmentForm />
            {schedule.timeslots.map((timeslot, index) => <Timeslot 
                appointments={timeslot.appointments} 
                mode={CalendarMode.SCHEDULING} 
                instant={timeslot.instant} 
                index={index.toString()}
            />)}
        </>
    }
    
    return <FullWidthPage 
        subtitle={weekday}
        title={<SchedulingHomeTitle />} 
        toolbarItems={GetToolbar()}  
    >
        <CalendarAppAlerts />
        <CalendarAppContent />
    </FullWidthPage>
}

////// DATA HOOKS //////
async function toggleLockForAll(isUnlock: boolean, forDate: Date) {
    return await new AppointmentsAPI().ToggleLockForAll(isUnlock, forDate)
}


