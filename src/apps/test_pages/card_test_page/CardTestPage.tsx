import FullWidthPage from "../../../layouts/FullWidthPage/FullWidthPage";
import { ToolbarButton, ToolbarElement, ToolbarLink, ToolbarModal } from "../../../layouts/Toolbar/Toolbar";
import { TestGrayCard, TestPinkCard, TestBlueCard } from "./TestCards";

export function CardTestPage() {
    const toolbar: ToolbarElement[] = [
        // new ToolbarLink({
        //     href: "",
        //     text: "Toolbar Link"
        // }),
        // new ToolbarButton({
        //     onClick: () => {},
        //     text: "Toolbar Button"
        // }),
        <ToolbarLink 
        href=""
        text="Toolbar Link"
        />,
        <ToolbarButton 
            onClick={() => {}}
            text="Toolbar Button"
        />,
        <ToolbarModal 
            text={"Toolbar Modal"} 
            canSubmit={() => true}
            extendOnSubmit={() => {}}
            modalTitle={"Toolbar Modal"} 
            children={<></>}        
        />
    ]

    return <FullWidthPage 
        title="Card Test Page"  
        subtitle="For testing purposes only"
        toolbarItems={toolbar}  
    >
        <ul style={{columns: 2}}>
            <TestGrayCard />
            <TestPinkCard />
            <TestBlueCard />
        </ul>
    </FullWidthPage>
}

