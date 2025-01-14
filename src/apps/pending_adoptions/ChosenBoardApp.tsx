import { useEffect } from "react";
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage";
import { IPendingAdoption, PendingAdoption } from "./models/PendingAdoption";
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
import { PendingAdoptionStatus } from "./enums/Enums";

export function ChosenBoardApp() {
    const store = useStore(useChosenBoardState)
    
    useEffect(() => {
        store.refresh()
    }, [])

    function RowGroup(adoptions: IPendingAdoption[]) {
        const adoptionObjs = adoptions.map(a => new PendingAdoption(a))
        adoptionObjs.sort((a, b) => a.dog.localeCompare(b.dog))

        if (adoptionObjs.length > 0) {
            return <>
                <tr 
                    className="group-subheader no-border" 
                >
                    <td colSpan={5}>
                        {adoptionObjs[0].getStatus(true)}
                    </td>
                </tr>
                {adoptionObjs.map(a => {
                    return <tr>
                        <td>
                            <span className="dog-name">{a.dog.toLocaleUpperCase()}</span><br />
                            <span className="small-detail">({a.adopter.fullName.toLocaleUpperCase()})</span>
                        </td>
                        <td>
                            {a.sourceAppointment 
                                ? <>
                                    {moment(a.sourceAppointment.instant).format("MMMM D, YYYY")}<br />
                                    {moment(a.sourceAppointment.instant).format("h:mm A")}
                                </>
                                : <>
                                    {a.getCircumstance()}<br />
                                    {moment(a.created).format("MMMM D, YYYY h:mm A")}<br />
                                </>}
                        </td>
                        <td>
                            {a.getStatus()}
                            {a.readyToRollInstant && !a.paperworkAppointment
                                ? <><br />{moment(a.readyToRollInstant).format("MMMM D, YYYY h:mm A")}</>
                                : null}
                            {a.paperworkAppointment 
                                ? <><br />{moment(a.paperworkAppointment.instant).format("MMMM D, YYYY h:mm A")}</>
                                : null}
                        </td>
                        <td>
                            <div>
                                <details>
                                    <summary>
                                        {a.overdueForUpdate() 
                                            ? <b className="overdue">Overdue for Update!</b>
                                            : <b>{`Updates Sent (${a.updates.length}):`}</b>}
                                    </summary>
                                    <ul>
                                        {a.getSortedUpdates().map(u => <li>{moment(u.instant).format("MMM D, h:mm A")}</li>)}
                                    </ul>
                                </details>     
                            </div>
                            <MessagingModal 
                                recipient={a.adopter} 
                                subject={`An update on ${a.dog}`} 
                                buttonClass={"submit-button"} 
                                launchBtnLabel={"Send Update"}
                                buttonId={`send-update`}
                                modalTitle="Send Update"
                                quickTexts={ChosenBoardQuickTexts(a)}
                                extendOnSubmit={async (message, subject) => {
                                    await new PendingAdoptionsAPI().CreateUpdate(
                                        a.id,
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
                })}
            </>
        }

    }
    
    if (store.adoptions) {
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
                {Object.values(PendingAdoptionStatus).reverse().map(status => {
                    return RowGroup(store.adoptions.filter(a => a.status == status))
                })}
            </table>
        </FullWidthPage>
    }   
}