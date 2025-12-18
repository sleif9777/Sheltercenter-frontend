import { create } from "zustand"
import { PendingAdoption } from "../models/PendingAdoption";
import { PendingAdoptionsAPI } from "../api/API";
import { AxiosResponse } from "axios";
import { IAdopterBase } from "../../adopters/models/Adopter";
import { AdopterAPI } from "../../adopters/api/API";

export interface ChosenBoardContext {
    adoptions: PendingAdoption[],
    adopterOptions: IAdopterBase[],
    refreshingAdoptions: boolean,
    refreshingAdopters: boolean,
}

interface ChosenBoardState extends ChosenBoardContext {
    refresh: () => void,
}

export const useChosenBoardState = create<ChosenBoardState>((set) => ({
    adoptions: [],
    adopterOptions: [],
    refreshingAdoptions: false,
    refreshingAdopters: false,
    refresh: async () => {
        set(() => ({
            refreshingAdoptions: true,
            refreshingAdopters: true,
        }))

        const adoptionsResponse: AxiosResponse<ChosenBoardContext> = await new PendingAdoptionsAPI().GetAllPendingAdoptions()
        set(() => ({
            refreshingAdoptions: false,
            adoptions: adoptionsResponse.data.adoptions,
        }))
        
        const adoptersResponse: AxiosResponse<{adopters: IAdopterBase[]}> = await new AdopterAPI().GetAllAdopters()
        set(() => ({ 
            adopterOptions: adoptersResponse.data.adopters,
            refreshingAdopters: false,
        })
    )}
}));