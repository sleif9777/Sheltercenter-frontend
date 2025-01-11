import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import { FieldProps } from "./FieldProps"

interface ButtonGroupProps extends Omit<FieldProps, "onChange"> {
    disabled?: boolean
    show: boolean
    value: number | undefined,
    buttons: { name: string, value: number }[]
    onChange: (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: number | undefined) => void
}

export default function ButtonGroup(props: ButtonGroupProps) {
    const { id, show, labelText, value, buttons, onChange, disabled } = props

    if (!show) {
        return
    }

    return <div >
        <label className="modal-form" htmlFor={id}>{labelText}</label>
        <ToggleButtonGroup 
            exclusive
            onChange={(e: React.MouseEvent<HTMLElement, MouseEvent>, newValue: number) => onChange(e, newValue)}
            value={value}
            disabled={disabled}
            id={id}
        >
            {buttons.map((button, i) => {
                return <ToggleButton key={i} value={button.value}>
                    {button.name}
                </ToggleButton>
            })}
        </ToggleButtonGroup>
    </div>
}