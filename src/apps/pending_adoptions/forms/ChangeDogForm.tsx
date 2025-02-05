import { TextField } from "@mui/material"
import { useState } from "react";

import ModalWithButton from "../../../components/modals/ModalWithButton";
import { PendingAdoptionsAPI } from "../api/API";
import { IPendingAdoption } from "../models/PendingAdoption";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

interface ChangeDogFormProps {
    extendOnSubmit?: () => void,
    adoption: IPendingAdoption
}

export function ChangeDogForm(props: ChangeDogFormProps) {
    const { adoption, extendOnSubmit } = props
    const [dog, setDog] = useState<string>(adoption.dog)

    const validate = () => {
        return dog != undefined && dog.length > 0
    }

    async function handleSubmit() {
        const data = {
            newDog: dog,
            adoptionID: adoption.id,
        }

        await new PendingAdoptionsAPI().ChangeDog(data)
        
        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    return <ModalWithButton 
            height={"30%"}
            buttonClass={"chosen-board-action retain-size"} 
            canSubmit={() => validate()}
            extendOnSubmit={() => handleSubmit()}
            launchBtnLabel={<FontAwesomeIcon icon={faPencil} />}
            buttonId={`launch-change-dog`}
            modalTitle="Change Dog"
        >
        <div className="form-content">
            <TextField
                id="outlined-controlled"
                label="Dog"
                margin="dense"
                style={{marginRight: 5}}
                value={dog}
                onChange={(e) => setDog(e.target.value)}
            />
        </div>
    </ModalWithButton>
}