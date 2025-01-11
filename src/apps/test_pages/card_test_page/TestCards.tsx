import { faEraser, faLock, faPencil, faTrash, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { PhotoCard, StandardCard } from "../../../components/card/Card";
import { CardActionButton, CardActionButtonProps } from "../../../components/card/CardActionButton";
import { CardColor } from "../../../components/card/CardEnums";
import { CardTableSection } from "../../../components/card/CardTableSection";
import { CardItemListSection } from "../../../components/card/CardItemListSection";
import { TwoColumnListItem } from "../../../components/two_column_list/TwoColumnList";

export function TestGrayCard() {
    return <StandardCard 
        color={CardColor.GRAY} 
        description="Title"
        actions={TestActions}
        topDetails={TestTopDetails}
    >
        <TestCardTableSection />
        <TestCardItemListSection />
    </StandardCard>
}

export function TestPinkCard() {
    return <StandardCard 
        color={CardColor.PINK} 
        description="Title"
        actions={TestActions}
        topDetails={TestTopDetails}
    >
        <TestCardTableSection />
        <TestCardItemListSection />
    </StandardCard>
}

export function TestBlueCard() {
    return <PhotoCard 
        color={CardColor.BLUE} 
        description="Title"
        actions={TestActions}
        topDetails={TestTopDetails}
        photoPath="https://plus.unsplash.com/premium_photo-1694819488591-a43907d1c5cc?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3V0ZSUyMGRvZ3xlbnwwfHwwfHx8MA%3D%3D"
    >
        <TestCardTableSection />
        <TestCardItemListSection />
    </PhotoCard>
}

const TestActions: React.ReactElement<CardActionButtonProps>[] = [
    <CardActionButton 
        icon={faPencil}
        extendOnClick={() => {}}
        id={"edit-btn"}
        tooltipContent={"Edit"}
        tooltipId={"edit-ttp"}
    />
    // {
    //     icon: faEraser,
    //     extendOnClick: () => {},
    //     id: "remove-btn",
    //     tooltipContent: "Remove",
    //     tooltipId: "remove-ttp"
    // },
    // {
    //     icon: faTrash,
    //     extendOnClick: () => {},
    //     id: "delete-btn",
    //     tooltipContent: "Delete",
    //     tooltipId: "delete-ttp"
    // },
    // {
    //     icon: faLock,
    //     extendOnClick: () => {},
    //     id: "lock-btn",
    //     toggle: {
    //         default: false,
    //         altIcon: faUnlock,
    //         altTooltipContent: "Unlock",
    //     },
    //     tooltipContent: "Lock",
    //     tooltipId: "lock-ttp"
    // }
]

const TestTopDetails: TwoColumnListItem[] = [
    {text: "Top Detail 1"},
    {text: "Top Detail 2"},
    {text: "Top Detail 3"},
    {text: "Top Detail 4"},
]

const TestSectionAction: CardActionButtonProps[] = [
    {
        icon: faPencil,
        extendOnClick: () => {},
        id: "edit-cs-btn",
        tooltipContent: "Edit",
        tooltipId: "edit-cs-ttp"
    },
]

function TestCardTableSection(): JSX.Element {
    return <CardTableSection 
        actions={TestSectionAction}
        data={[
            {
                label: "Label 1",
                content: "Content 1"
            },
            {
                label: "Label 2",
                content: "Content 2"
            },
            {
                label: "Label 3",
                content: "Content 3"
            },
        ]}
        title="Table Section"
        showBorder={true}
    />
} 

function TestCardItemListSection(): JSX.Element {
    const data: TwoColumnListItem[] = [
        {text: "List Item 1"},
        {text: "List Item 2"},
        {text: "List Item 3"},
        {text: "List Item 4"},
    ]

    return <CardItemListSection 
        data={data} 
        showBorder={false} 
        title="Item List Section" 
    />
}