import { useEffect } from "react";
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage";
import { PendingAdoption } from "./models/PendingAdoption";
import { ChosenBoardActions } from "./components/ChosenBoardActions";
import { useStore } from "zustand";
import { useChosenBoardState } from "./state/State";
import { PendingAdoptionForm } from "./forms/PendingAdoptionForm";
import moment from "moment";
import { MessagingModal } from "../messaging/MessagingModal";
import { PendingAdoptionsAPI } from "./api/API";
import { ChosenBoardQuickTexts } from "./QuickTexts";

import "../scheduling/pages/print_view/ReportingPage.scss"
import "./ChosenBoardApp.scss"

export function ChosenBoardApp() {
    const store = useStore(useChosenBoardState)
    
    useEffect(() => {
        store.refresh()
    }, [])

    const rows = store
        .adoptions?.sort((a, b) =>{
            const aInstant = a.paperworkAppointment?.instant ?? new Date()
            const bInstant = b.paperworkAppointment?.instant ?? new Date()

            if (a.status === b.status) {
                return aInstant > bInstant ? 1 : -1
            }

            return a.status < b.status ? 1 : -1
        }).map(a => {
            const adoption = new PendingAdoption(a)

            return <tr>
                <td>
                    {adoption.sourceAppointment 
                        ? <>
                            {moment(adoption.sourceAppointment.instant).format("MMMM D, YYYY")}<br />
                            {moment(adoption.sourceAppointment.instant).format("h:mm A")}
                        </>
                        : <>
                            {adoption.getCircumstance()}<br />
                            {moment(adoption.created).format("MMMM D, YYYY h:mm A")}<br />
                        </>}
                </td>
                <td>{adoption.adopter.fullName.toLocaleUpperCase()} - {a.dog}</td>
                <td>
                    {adoption.getStatus()}
                    {adoption.paperworkAppointment 
                        ? <><br />{moment(adoption.paperworkAppointment.instant).format("MMMM D, YYYY h:mm A")}</>
                        : null}
                </td>
                <td>
                    <div>
                        <details>
                            <summary>
                                {adoption.overdueForUpdate() 
                                    ? <b className="overdue">Overdue for Update!</b>
                                    : <b>{`Updates Sent (${adoption.updates.length}):`}</b>}
                            </summary>
                            <ul>
                                {adoption.getSortedUpdates().map(u => <li>{moment(u.instant).format("MMM D, h:mm A")}</li>)}
                            </ul>
                        </details>     
                    </div>
                    <MessagingModal 
                        recipient={adoption.adopter} 
                        subject={`An update on ${adoption.dog}`} 
                        buttonClass={"submit-button"} 
                        launchBtnLabel={"Send Update"}
                        buttonId={`send-update`}
                        modalTitle="Send Update"
                        quickTexts={ChosenBoardQuickTexts(adoption)}
                        extendOnSubmit={async (message, subject) => {
                            await new PendingAdoptionsAPI().CreateUpdate(
                                adoption.id,
                                message,
                                subject
                            )
                            store.refresh()
                        }}
                    />
                </td>
                <td>
                    <ChosenBoardActions adoption={a} />
                </td>
            </tr>
        })

    return <FullWidthPage title={"Chosen Board"}>
        <PendingAdoptionForm extendOnSubmit={() => store.refresh()} /><br />
        <i>Schedule paperwork appointments directly in the calendar.</i>
        <table className="report">
            <tr className="no-border">
                <th>Original Appointment</th>
                <th>Adoption</th>
                <th>Status</th>
                <th>Updates</th>
                <th>Actions</th>
            </tr>
            {rows}
        </table>
    </FullWidthPage>
}