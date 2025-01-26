import { FieldProps } from "./FieldProps"
import { CheckboxField } from "./CheckboxField"
import "./ButtonGroup.scss"

interface ButtonGroupProps extends Omit<FieldProps, "onChange"> {
    show: boolean,
    singleColumn?: boolean,
    value: number | undefined,
    buttons: { name: string, value: number }[]
    onChange: (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: number | undefined) => void
}

export default function ButtonGroup(props: ButtonGroupProps) {
    const { id, show, labelText, value, buttons, singleColumn, onChange } = props

    if (!show) {
        return
    }

    return <div >
        <label className="modal-form" htmlFor={id}>{labelText}</label>
        <ul id="options" className={singleColumn ? "single-column" : ""}>
            {buttons.map((button, i) => {
                return <li><CheckboxField 
                    toggleValue={(e: React.MouseEvent<HTMLElement, MouseEvent>) => onChange(e, button.value)} 
                    checkByDefault={button.value === value} 
                    labelText={button.name} 
                    id={id + "-button-" + i}                
                /></li>
            })}
        </ul>
    </div>
}