import { FieldProps } from "./FieldProps"

import "./CheckboxField.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition, faPaw } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

interface CheckboxFieldProps extends FieldProps {
    toggleValue: (() => void) | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    checkByDefault: boolean
    customIcon?: IconDefinition
    className?: string
}

export function CheckboxField(props: CheckboxFieldProps) {
    const { id, customIcon, labelText, checkByDefault, toggleValue, className } = props
    const [isSelected, setIsSelected] = useState<boolean>(checkByDefault)

    return <div 
        className={`checkbox ${className}`}
        onClick={(e) => {
            toggleValue(e)
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
                id={id}
                checked={isSelected} 
                style={{
                    display: "none",
                    marginLeft: 4,
                    verticalAlign: "middle"
                }}
                onChange={() => {}}
            />
            <span className="label">
                <FontAwesomeIcon className="icon" icon={customIcon ?? faPaw} />
                {labelText}
            </span>
        </label>
    </div>
}