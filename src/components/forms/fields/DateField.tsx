import moment from "moment";
import { DatePicker } from "rsuite";

import { FieldProps } from "./FieldProps";

import 'rsuite/dist/rsuite.min.css';
import './DateField.scss'

interface DateFieldProps extends FieldProps {
    placeholder?: Date,
    changeDate: (date: Date | null) => void
    defaultValue?: Date
}

export function DateField(props: DateFieldProps) {
    const { id, labelText, placeholder, changeDate, defaultValue } = props

    return <>
        <label className="modal-form" htmlFor={id}>{labelText}</label>
        <DatePicker 
            oneTap
            size="lg" 
            id={id}
            defaultValue={defaultValue}
            placeholder={moment(placeholder).format("MM/DD/yyyy")} 
            format="MM/dd/yyyy"
            className="modal-date-picker" 
            onChange={(date) => changeDate(date)}
            limitStartYear={new Date().getFullYear()}
        />
    </>
}