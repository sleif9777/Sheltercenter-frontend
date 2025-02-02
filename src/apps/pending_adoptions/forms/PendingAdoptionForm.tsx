import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

import ButtonGroup from "../../../components/forms/fields/ButtonGroup";
import ModalWithButton from "../../../components/modals/ModalWithButton";
import { AdopterAPI } from "../../adopters/api/API";
import { Adopter, IAdopter } from "../../adopters/models/Adopter";
import { PendingAdoptionsAPI } from "../api/API";
import { PendingAdoptionCircumstance } from "../enums/Enums";
import { IPendingAdoption } from "../models/PendingAdoption";

interface PendingAdoptionFormProps {
    extendOnSubmit?: () => void,
    defaults?: IPendingAdoption
}

export function PendingAdoptionForm(props: PendingAdoptionFormProps) {
    const { defaults, extendOnSubmit } = props

    const [dog, setDog] = useState<string | undefined>(undefined)
    const [adopter, setAdopter] = useState<Adopter | undefined>(undefined)
    const [circumstance, setCircumstance] = useState<PendingAdoptionCircumstance>()
    const [adopterOptions, setAdopterOptions] = useState<Adopter[]>([])
        
    const fetchData = async () => {
        const response: AxiosResponse<{adopters: IAdopter[]}> = await new AdopterAPI().GetAllAdopters()
        setAdopterOptions(response.data.adopters.map(adopter => new Adopter(adopter)))
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    const setDefaults = () => {
        if (defaults) {
            setDog(defaults.dog)
            setAdopter(new Adopter(defaults.adopter))
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
        validate()
        
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
            buttonClass={"submit-button"} 
            canSubmit={() => validate()}
            extendOnSubmit={() => handleSubmit()}
            extendOnClose={() => setDefaults()}
            launchBtnLabel={"Add Adoption"}
            buttonId={`launch-create-appointment`}
            modalTitle="Add Adoption"
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
                    // placeholder="Select an adopter"
                    fullWidth
                    onChange={(e) => {
                        const newAdopter = adopterOptions.find(a => a.ID == e.target.value)
                        setAdopter(newAdopter)
                    }}
                >
                    {adopterOptions
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