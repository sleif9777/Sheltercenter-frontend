import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import PlaceholderText from "./PlaceholderText";

interface LoadingPlaceholderProps {
    what: string
}

export function LoadingPlaceholder(props: LoadingPlaceholderProps) {
    return <PlaceholderText iconDef={faSpinner} text={`Loading ${props.what}...`} />
}