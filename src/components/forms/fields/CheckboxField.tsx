import { FieldProps } from "./FieldProps"

interface CheckboxFieldProps extends FieldProps {
    toggleValue: () => void
    checkByDefault: boolean
}

export function CheckboxField(props: CheckboxFieldProps) {
    const { id, labelText, checkByDefault, toggleValue } = props

    return <div>
        <label 
            className="modal-form" 
            htmlFor={id}
            style={{verticalAlign: "middle"}}
        >
            {labelText}
            <input 
                type="checkbox" 
                checked={checkByDefault} 
                onChange={() => toggleValue()} 
                style={{
                    marginLeft: 4,
                    verticalAlign: "middle"
                }}
            />
        </label>
    </div>
}