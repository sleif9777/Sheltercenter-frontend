import TwoColumnPage from "../../../layouts/TwoColumnPage/TwoColumnPage";
import { TestBlueCard } from "../card_test_page/TestCards";

export function TwoColumnTestPage() {
    const rightContent = <>
        <TestBlueCard />
        <TestBlueCard />
        <TestBlueCard />
        <TestBlueCard />
        <TestBlueCard />
        <TestBlueCard />
    </>

    return <TwoColumnPage 
        title="Two Column Page"
        titlePosition="left"
        leftContent={<></>} 
        rightContent={rightContent} 
    />
}