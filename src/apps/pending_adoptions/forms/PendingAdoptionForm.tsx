import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useState } from "react";
import { useStore } from "zustand";

import ButtonGroup from "../../../components/forms/fields/ButtonGroup";
import ModalWithButton from "../../../components/modals/ModalWithButton";
import { IAdopterBase } from "../../adopters/models/Adopter";
import { PendingAdoptionsAPI } from "../api/API";
import { PendingAdoptionCircumstance } from "../enums/Enums";
import { IPendingAdoption } from "../models/PendingAdoption";
import { useChosenBoardState } from "../state/State";

interface PendingAdoptionFormProps {
    extendOnSubmit?: () => void,
    defaults?: IPendingAdoption
}

export function PendingAdoptionForm(props: PendingAdoptionFormProps) {
    const { defaults, extendOnSubmit } = props
    const board = useStore(useChosenBoardState)

    const [dog, setDog] = useState<string | undefined>(undefined)
    const [adopter, setAdopter] = useState<IAdopterBase | undefined>(undefined)
    const [circumstance, setCircumstance] = useState<PendingAdoptionCircumstance>()

    const setDefaults = () => {
        if (defaults) {
            setDog(defaults.dog)
            setAdopter(defaults.adopter)
            setCircumstance(defaults.circumstance)
            return
        }

        setDog(undefined)
        setAdopter(undefined)
        setCircumstance(undefined)
    }

    const validate = () => {
        return (dog != undefined && dog.length > 0) &&
            (adopter != undefined) &&
            (circumstance != undefined)
    }

    async function handleSubmit() {        
        const data = {
            dog: dog,
            adopter: adopter!.ID,
            circumstance: circumstance
        }

        await new PendingAdoptionsAPI().CreatePendingAdoption(data)
        
        setDefaults()

        if (extendOnSubmit) {
            extendOnSubmit()
        }
    }

    return <ModalWithButton 
        height={"50%"}
        buttonClass={"submit-button desktop-only"} 
        canSubmit={() => validate()}
        extendOnSubmit={() => handleSubmit()}
        extendOnClose={() => setDefaults()}
        launchBtnLabel={"Add Adoption"}
        buttonId={`launch-create-appointment`}
        modalTitle="Add Adoption"
        disabled={board.refreshingAdopters}
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
            <>
                <InputLabel id="adopter">Adopter</InputLabel>
                <Select
                    id="adopter"
                    value={adopter?.ID}
                    label="Adopter"
                    fullWidth
                    onChange={(e) => {
                        const newAdopter = board.adopterOptions.find(a => a.ID == e.target.value)
                        setAdopter(newAdopter)
                    }}
                >
                    {board.adopterOptions
                        .sort((a, b) => a.fullName.localeCompare(b.fullName))
                        .map(adopter => <MenuItem value={adopter.ID}>
                            {adopter.disambiguatedName}
                        </MenuItem>)
                    }
                </Select>
            </>
            <ButtonGroup
                show={true} 
                value={circumstance} 
                buttons={[
                    { name: "Host Weekend", value: 0 },
                    { name: "Foster", value: 1 },
                    { name: "Open House", value: 6 },
                    { name: "Friend of Foster", value: 3 },
                    { name: "Friend of Molly", value: 4 },
                    { name: "Other", value: 5 },
                ]} 
                onChange={(_, newCircumstance) => setCircumstance(newCircumstance)} 
                labelText={"Adoption Context"} 
                id={"circumstance"}            
            />
        </div>
    </ModalWithButton>
}