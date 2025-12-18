import { ChangeEvent } from "react";

export interface FieldProps {
    labelText: string,
    id: string,
    defaultValue?: any,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
}