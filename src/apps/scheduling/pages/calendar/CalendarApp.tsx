import { faPaw, faPencil, faQuestionCircle, faShieldDog, faShopLock, faSpinner, faTrash, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons"
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
import { DateTimeStrings } from "../../../../utils/DateAndTimeStrings"
import { fullyBookedDay, Timeslot } from "../../components/Timeslot"
import { CalendarMode, Weekday } from "../../enums/Enums"
import { AppointmentsAPI } from "./api/AppointmentsAPI"
import { ClosedDatesAPI } from "./api/ClosedDatesAPI"
import { EmptyDatesAlert } from "./components/alerts/EmptyDatesAlert"
import { MissingOutcomesAlert } from "./components/alerts/MissingOutcomesAlert"
import { AppointmentCard } from "./components/card/AppointmentCard"
import { SchedulingHomeTitle } from "./components/SchedulingHomeTitle"
import { AppointmentForm } from "./forms/appointment/AppointmentForm"
import { Appointment } from "./models/Appointment"
import { useSchedulingHomeState } from "./state/State"
import { JumpToTimeslots } from "./components/alerts/JumpToTimeslots"
import { AdopterFlagsAlert } from "./components/alerts/AdopterFlagsAlert"
import { Collapsible } from "../../../../components/collapsible/Collapsible"
import { StandardCard } from "../../../../components/card/Card"
import { CardColor } from "../../../../components/card/CardEnums"
import { CardSectionBase } from "../../../../components/card/CardSectionBase"

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
                const adopterAlerts = [<UserInstructions />];
                if (store.userCurrentAppointment) {
                    adopterAlerts.unshift(<AppointmentCard 
                        appointment={new Appointment(store.userCurrentAppointment)} 
                        context="Current Appointment"
                    />)
                }
                return adopterAlerts
            case SecurityLevel.GREETER:
                return [
                    <JumpToTimeslots />
                ] // TODO: Short notices, internal notes
            case SecurityLevel.ADMIN:
            case SecurityLevel.SUPERUSER:
                return [
                    <EmptyDatesAlert />,
                    <MissingOutcomesAlert />,
                    <JumpToTimeslots />,
                    <AdopterFlagsAlert />
                ]
            default:
                return []
        }
    }

    const getContent = () => {
        if (session.securityLevel == undefined) {
            return <></>
        }

        if (store.currentlyRefreshingAppointments) {
            return <>
                <PlaceholderText iconDef={faSpinner} text={"Loading appointments..."} />
            </>
        }

        if (session.adopterUser && store.userExceptions.length > 0) {
            return <>
                <PlaceholderText iconDef={faShieldDog} text={"Congrats on your adoption!"} />
                <p>
                    Calendar access is restricted after choosing a dog. Email adoptions@savinggracenc.org for futher assistance, including any of the following:
                </p>
                <ul>
                    <li>My dog is pending, and I want to visit.</li>
                    <li>I need to surrender my adopted or foster-to-adopt dog.</li>
                    <li>I want to begin a new adoption.</li>
                </ul>
            </>
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

        if (session.adopterUser) {
            const difference = moment(store.viewDate).diff(moment(new Date), 'days') + 1
            const pastCloseTime = store.timeslots.filter(t => moment(t.instant).isAfter(moment())).length === 0
            let text = ""

            if (difference > 14) {
                text = "Appointments will be open for booking two weeks in advance."
            }

            if (difference < 1 || pastCloseTime) {
                text = "This date is now closed."
            }

            if (text.length > 0) {
                return <PlaceholderText iconDef={faShieldDog} text={text} />
            }
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

        let adopterBookedOnThisDay = false
        if (store.userCurrentAppointment) {
            const dateKey = (date: Date) => {
                return date.toISOString().split("T")[0]
            }

            if (dateKey(store.viewDate) === store.userCurrentAppointment.instant.toString().split("T")[0]) {
                adopterBookedOnThisDay = true
            }
        }

        const fullyBooked = fullyBookedDay(store.timeslots, session.userID)
        // Show placeholder if all appointments booked
        if (session.adopterUser && 
            (fullyBooked) &&
            !adopterBookedOnThisDay) {
            return <PlaceholderText 
                iconDef={faShieldDog} 
                text={"All appointments on this date are booked."} 
            />
        }

        return <>
            <AppointmentForm />
            {store.timeslots.map((timeslot, index) => <Timeslot 
                appointments={timeslot.appointments} 
                mode={CalendarMode.SCHEDULING} 
                instant={timeslot.instant} 
                index={index.toString()}
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

    function AlertsSection() {
        return <>
            <Collapsible 
                items={alerts()} 
                buttonLabel="Show Alerts" 
                disableButton={
                    store.currentlyRefreshingAppointments || 
                    store.currentlyRefreshingAdoptions || 
                    store.currentlyRefreshingAdopters
                }
                className="mobile-only"
            />
            <div className="desktop-only">
                <ul style={{ columnCount: session.adopterUser ? 2 : 3 }}>
                    {alerts().map(a => <li>{a}</li>)}
                </ul>
            </div>
        </>
    }
    
    return <FullWidthPage 
        subtitle={weekday}
        title={<SchedulingHomeTitle />} 
        toolbarItems={toolbarItems()}  
    >
        <AlertsSection />
        {getContent()}
    </FullWidthPage>
}

function UserInstructions(): JSX.Element {
    return <StandardCard color={CardColor.PINK} description={"Help"} topIcon={faQuestionCircle}>
        <CardSectionBase showBorder={false}>
            <b style={{ fontSize: "large", textDecoration: "underline" }}>Using the Scheduler</b>
            <ul>
                <li>The scheduler works best on desktops and laptops.</li>
                <li>Click the <FontAwesomeIcon icon={faWandMagicSparkles} /> magic wand icon to open the booking form.</li>
                <li>Fill the booking form out and press Accept to confirm.</li>
                <li>Click the <FontAwesomeIcon icon={faPencil} /> trash can icon to edit your appointment.</li>
                <li>Click the <FontAwesomeIcon icon={faTrash} /> trash can icon to cancel your appointment.</li>
            </ul>
            <b style={{ fontSize: "large", textDecoration: "underline" }}>Appointment Types</b>
            <ul>
                <li><b>"Fun Size"</b> appointments are for specific <u>adult</u> dogs under 20 lbs living in foster homes (<a href="https://savinggracenc.org/adopt/meet-our-dogs/" target="_blank">noted on their profile</a>). These dogs are available to meet Fridays and Saturdays.</li>
                <li><b>"Puppies"</b> appointments are for all available puppies (regardless of size).</li>
                <li><b>"All Ages"</b> appointments are for all available puppies and adults above 20 pounds not listed as "by appointment only".</li>
            </ul>
            <b style={{ fontSize: "large", textDecoration: "underline" }}>Interested in a specific dog?</b>
            <p>If interested in a specific dog, <a href="https://savinggracenc.org/adopt/meet-our-dogs/" target="_blank">check for an arrival date on their profile</a>. If listed, book as early as possible on their arrival date or after and mention that dog in the appointment notes. If no listed date, the dog is available to meet at any time.</p>
        </CardSectionBase>
    </StandardCard>
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
        height="30%"
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
