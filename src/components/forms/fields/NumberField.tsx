import { FieldProps } from "./FieldProps"

export function NumberField(props: FieldProps) {
    const { id, labelText, defaultValue, onChange } = props

    return <div>
        <label 
            className="modal-form" 
            htmlFor={id}
            style={{verticalAlign: "middle"}}
        >
            {labelText}
            <input 
                type="number" 
                value={defaultValue}
                onChange={(e) => {
                    if (onChange) {
                        onChange(e)
                    }
                }} 
                style={{
                    marginLeft: 4,
                    verticalAlign: "middle"
                }}
            />
        </label>
    </div>
}