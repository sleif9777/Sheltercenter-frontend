import { faCheckCircle, faEraser, faThermometer, faUserDoctor, faVirus, faVirusSlash, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import { useStore } from "zustand";

import { PendingAdoptionsAPI } from "../api/API";
import { PendingAdoption } from "../models/PendingAdoption";
import { useChosenBoardState } from "../state/State";

import "../ChosenBoardApp.scss"
import { MessagingModal } from "../../messaging/MessagingModal";
import { ChosenBoardR2RQuickText } from "../QuickTexts";
import { IQuickText } from "../../messaging/QuickText";

interface ChosenBoardActionProps {
    adoption: PendingAdoption
}

export function ChosenBoardActions(props: ChosenBoardActionProps) {
    const { adoption } = props

    function NeedsVettingButton() {
        return <ChosenBoardActionButton 
            actionName="needs-vetting"
            adoption={adoption}
            icon={faUserDoctor}
            newStatus={1}
            tooltipContent="Needs Vetting"
        />
    }

    function NeedsWellCheckButton() {
        return <ChosenBoardActionButton 
            actionName="needs-well-check"
            adoption={adoption}
            icon={faThermometer}
            newStatus={2}
            tooltipContent="Needs Well Check"
        />
    }

    function CompleteButton() {
        return <ChosenBoardActionButton 
            actionName="complete"
            adoption={adoption}
            icon={faCheckCircle}
            newStatus={4}
            tooltipContent="Complete"
        />
    }

    function CancelButton() {
        return <ChosenBoardActionButton 
            actionName="cancel"
            adoption={adoption}
            icon={faEraser}
            newStatus={5}
            tooltipContent="Cancel"
        />
    }

    function R2RHWPosButton() {
        return <ChosenBoardMessageButton 
        // actionName, adoption, heartworm, icon, newStatus, tooltipContent
            actionName="ready-hwpos-"
            adoption={adoption}
            heartworm={true}
            icon={faVirus}
            newStatus={3}
            quickTexts={ChosenBoardR2RQuickText(adoption, true)}
            tooltipContent="Ready - HW Positive"
        />
    }

    function R2RHWNegButton() {
        return <ChosenBoardMessageButton 
            actionName="ready-hwneg-"
            adoption={adoption}
            heartworm={false}
            icon={faVirusSlash}
            newStatus={3}
            quickTexts={ChosenBoardR2RQuickText(adoption, false)}
            tooltipContent="Ready - HW Negative"
        />
    }

    return <>
        <NeedsVettingButton />
        <NeedsWellCheckButton />
        <R2RHWNegButton />
        <R2RHWPosButton />
        <CompleteButton />
        <CancelButton />
    </>
}

interface ChosenBoardActionButtonProps extends ChosenBoardActionProps {
    actionName: string,
    heartworm?: boolean
    icon: IconDefinition,
    newStatus: number,
    tooltipContent: string,
}

function ChosenBoardActionButton(props: ChosenBoardActionButtonProps) {
    const { actionName, adoption, heartworm, icon, newStatus, tooltipContent } = props
    const store = useStore(useChosenBoardState)

    return <>
        <button 
            className="chosen-board-action"
            data-tooltip-id={actionName + "-adoption-" + adoption.id + "-ttp"}
            id={actionName + "-adoption-" + adoption.id}
            onClick={async () => {
                await new PendingAdoptionsAPI().MarkStatus(adoption.id, newStatus, heartworm)
                store.refresh()
            }}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
        <Tooltip 
            anchorSelect={"#" + actionName + "-adoption-" + adoption.id}
            id={actionName + "-adoption-" + adoption.id + "-ttp"}
            content={tooltipContent}
            place="bottom-start"
        />
    </>
}

interface ChosenBoardMessageButtonProps extends ChosenBoardActionButtonProps {
    quickTexts: IQuickText[]
}

function ChosenBoardMessageButton(props: ChosenBoardMessageButtonProps) {
    const { actionName, adoption, heartworm, icon, newStatus, quickTexts, tooltipContent } = props
    const store = useStore(useChosenBoardState)

    return <MessagingModal 
        recipient={adoption.adopter} 
        subject={adoption.dog + " is ready to go home!"} 
        extendOnSubmit={async (message: string, _: string) => {
            await new PendingAdoptionsAPI().MarkStatus(adoption.id, newStatus, heartworm, message)
            store.refresh()
        }}
        quickTexts={quickTexts} 
        buttonClass="chosen-board-action" 
        buttonId={actionName + "-adoption-" + adoption.id} 
        launchBtnLabel={<FontAwesomeIcon icon={icon} />} 
        modalTitle="Ready to Roll!"
        tooltipText={tooltipContent}
        allowOnlyQuickTexts
    />
}