import ModalWithButton, { ModalWithButtonProps } from "./ModalWithButton";

export interface AreYouSureProps extends Omit<ModalWithButtonProps, "height" | "children"> {
    youWantTo: string
}

export function AreYouSure(props: AreYouSureProps) {
    return <ModalWithButton 
        height={"20%"}
        {...props}
    >
        <>
            <div style={{ paddingTop: 5 }}>Are you sure you want to {props.youWantTo}?</div>
            {/* <div>{props.children}</div> */}
        </>
    </ModalWithButton>
}