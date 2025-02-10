import { create } from "zustand"
import { PendingAdoption } from "../models/PendingAdoption";
import { PendingAdoptionsAPI } from "../api/API";
import { AxiosResponse } from "axios";
import { IAdopterBase } from "../../adopters/models/Adopter";
import { AdopterAPI } from "../../adopters/api/API";

export interface ChosenBoardContext {
    adoptions: PendingAdoption[],
    adopterOptions: IAdopterBase[],
    currentlyRefreshing: boolean,
}

interface ChosenBoardState extends ChosenBoardContext {
    refresh: () => void,
}

export const useChosenBoardState = create<ChosenBoardState>((set) => ({
    adoptions: [],
    adopterOptions: [],
    currentlyRefreshing: false,
    refresh: async () => {
        set(() => ({
            currentlyRefreshing: true
        }))
        const adoptionsResponse: AxiosResponse<ChosenBoardContext> = await new PendingAdoptionsAPI().GetAllPendingAdoptions()
        const adoptersResponse: AxiosResponse<{adopters: IAdopterBase[]}> = await new AdopterAPI().GetAllAdopters()
        set(() => ({ 
            adoptions: adoptionsResponse.data.adoptions,
            adopterOptions: adoptersResponse.data.adopters,
            currentlyRefreshing: false,
        })
    )}
}));