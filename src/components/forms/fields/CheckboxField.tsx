import { FieldProps } from "./FieldProps"

import "./CheckboxField.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition, faPaw } from "@fortawesome/free-solid-svg-icons"
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import { useState } from "react"

interface CheckboxFieldProps extends FieldProps {
    toggleValue: () => void
    checkByDefault: boolean
    customIcon?: IconDefinition
}

export function CheckboxField(props: CheckboxFieldProps) {
    const { id, customIcon, labelText, checkByDefault, toggleValue } = props
    const [isSelected, setIsSelected] = useState<boolean>(checkByDefault)

    return <div 
        className={`checkbox`}
        onClick={() => {
            toggleValue()
            setIsSelected(!isSelected)
        }}
    >
        <label 
            className="modal-form" 
            htmlFor={id}
            style={{verticalAlign: "middle"}}
        >
            <input 
                type="checkbox" 
                checked={checkByDefault} 
                style={{
                    display: "none",
                    marginLeft: 4,
                    verticalAlign: "middle"
                }}
            />
            <span className="label">
                <FontAwesomeIcon className="icon" icon={isSelected ? (customIcon ?? faPaw) : faSquare} />
                {labelText}
            </span>
        </label>
    </div>
}