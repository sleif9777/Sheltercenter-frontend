import { createTheme, ThemeProvider, PaletteColor, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { AdopterApprovalStatus } from "../enums/AdopterEnums";

declare module "@mui/material/styles" {
    interface Palette {
        approved: PaletteColor
        pending: PaletteColor
        denied: PaletteColor
    }

    interface PaletteOptions {
        approved: PaletteColor
        pending: PaletteColor
        denied: PaletteColor    
    }
}

declare module "@mui/material/ToggleButtonGroup" {
    interface ToggleButtonGroupPropsColorOverrides {
        approved: true
        pending: true
        denied: true  
    }
}

// constant colors
const greenBase = '#2DA329'
const yellowBase = '#DEC628'
const redBase = '#A80E00'

// initialize the theme
const { palette } = createTheme()
const buttonTheme = createTheme({
    palette: {
        approved: palette.augmentColor({
            color: {
                main: greenBase,
            },
            name: 'approved',
        }),
        pending: palette.augmentColor({
            color: {
                main: yellowBase,
            },
            name: 'pending',
        }),
        denied: palette.augmentColor({
            color: {
                main: redBase,
            },
            name: 'denied',
        }),
    }
})

function getButtonColor(status: AdopterApprovalStatus): "approved" | "pending" | "denied" {
    switch (status) {
        case AdopterApprovalStatus.APPROVED:
            return "approved"
        case AdopterApprovalStatus.PENDING:
            return "pending"
        case AdopterApprovalStatus.DENIED:
            return "denied"
    }
}

// render the button group
interface StatusApprovalButtonGroupProps {
    defaultStatus: AdopterApprovalStatus,
    onChange: (event: React.MouseEvent<HTMLElement>, newStatus: AdopterApprovalStatus) => void
}

export default function AdopterStatusTriState(props: StatusApprovalButtonGroupProps) {
    const { defaultStatus, onChange } = props

    const buttonData = [
        { name: "Approved", value: AdopterApprovalStatus.APPROVED },
        { name: "Pending", value: AdopterApprovalStatus.PENDING },
        { name: "Denied", value: AdopterApprovalStatus.DENIED },
    ]

    return <ThemeProvider theme={buttonTheme}>
        <ToggleButtonGroup 
            color={getButtonColor(defaultStatus)}
            exclusive
            defaultValue={defaultStatus}
            onChange={(e, newStatus) => onChange(e, newStatus)}
            value={defaultStatus}
        >
            {buttonData.map((button, i) => {
                return <ToggleButton key={i} value={button.value}>
                    {button.name}
                </ToggleButton>
            })}
        </ToggleButtonGroup>
    </ThemeProvider>
}