import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PendingAdoption } from "../models/PendingAdoption";
import { IconDefinition, faCarBurst, faCheckCircle, faEraser, faThermometer, faUserDoctor, faVirus, faVirusSlash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import { PendingAdoptionsAPI } from "../api/API";
import { useStore } from "zustand";
import { useChosenBoardState } from "../state/State";
import "../ChosenBoardApp.scss"

interface ChosenBoardActionProps {
    adoption: PendingAdoption
}

export function ChosenBoardActions(props: ChosenBoardActionProps) {
    const { adoption } = props

    return <>
        <ChosenBoardActionButton 
            actionName="needs-vetting"
            adoption={adoption}
            icon={faUserDoctor}
            newStatus={1}
            tooltipContent="Needs Vetting"
        />
        <ChosenBoardActionButton 
            actionName="needs-well-check"
            adoption={adoption}
            icon={faThermometer}
            newStatus={2}
            tooltipContent="Needs Well Check"
        />
        <ChosenBoardActionButton 
            actionName="ready-hwneg-"
            adoption={adoption}
            heartworm={false}
            icon={faVirusSlash}
            // TODO: Make this launch a HW modal
            newStatus={3}
            tooltipContent="Ready - HW Negative"
        />
        <ChosenBoardActionButton 
            actionName="ready-hwpos-"
            adoption={adoption}
            heartworm={true}
            icon={faVirus}
            // TODO: Make this launch a HW modal
            newStatus={3}
            tooltipContent="Ready - HW Positive"
        />
        <ChosenBoardActionButton 
            actionName="complete"
            adoption={adoption}
            icon={faCheckCircle}
            newStatus={4}
            tooltipContent="Complete"
        />
        <ChosenBoardActionButton 
            actionName="cancel"
            adoption={adoption}
            icon={faEraser}
            newStatus={5}
            tooltipContent="Cancel"
        />
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