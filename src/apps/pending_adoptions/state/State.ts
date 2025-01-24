import { create } from "zustand"
import { PendingAdoption } from "../models/PendingAdoption";
import { PendingAdoptionsAPI } from "../api/API";
import { AxiosResponse } from "axios";

export interface ChosenBoardContext {
    adoptions: PendingAdoption[],
    currentlyRefreshing: boolean,
}

interface ChosenBoardState extends ChosenBoardContext {
    refresh: () => void,
}

export const useChosenBoardState = create<ChosenBoardState>((set) => ({
    adoptions: [],
    currentlyRefreshing: false,
    refresh: async () => {
        set(() => ({
            currentlyRefreshing: true
        }))
        const context: AxiosResponse<ChosenBoardContext> = await new PendingAdoptionsAPI().GetAllPendingAdoptions()
        set(() => ({ 
            adoptions: context.data.adoptions,
            currentlyRefreshing: false,
        })
    )}
}));