import ModalWithButton, { ModalWithButtonProps } from "./ModalWithButton";

export interface AreYouSureProps extends ModalWithButtonProps {
    youWantTo: string
}

export function AreYouSure(props: AreYouSureProps) {
    return <ModalWithButton 
        {...props}
    >
        <>
            <div>Are you sure you want to {props.youWantTo}?</div>
            <div>{props.children}</div>
        </>
    </ModalWithButton>
}