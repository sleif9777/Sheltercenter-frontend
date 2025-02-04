import { useEffect, useState } from "react"
import { TextField } from "@mui/material"
import { faDog, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { AxiosResponse } from "axios"
import LinkToAdopterPage from "./components/LinkToAdopterPage"
import { Adopter, IAdopterBase } from "../../models/Adopter"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../../../layouts/PlaceholderText/PlaceholderText"
import { AdopterAPI } from "../../api/API"
import "./ManageAdoptersApp.scss"

export default function ManagerAdoptersApp() {
    const fetchData = async () => {
        const response: AxiosResponse<{adopters: IAdopterBase[]}> = await new AdopterAPI().GetAllAdopters()
        setAllAdopters(response.data.adopters)
        console.log(response.data.adopters)
    }

    const [allAdopters, setAllAdopters] = useState<IAdopterBase[]>([])
    const [displayAdopters, setDisplayAdopters] = useState<IAdopterBase[]>([])
    const [filterText, setFilterText] = useState<string>("")
    
    const showError = () => {
        return filterText.length > 3 && (displayAdopters.length == 0)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (filterText.length < 3) {
            setDisplayAdopters([])
        } else {
            setDisplayAdopters(
                allAdopters
                    .filter(adopter => Adopter.matchesSearch(adopter, filterText))
                    .sort((a, b) => a.fullName.localeCompare(b.fullName))
            )
        }
    }, [filterText])

    if (allAdopters.length == 0) {
        return <FullWidthPage title={"Manage Adopters"}>
            <div>
                <PlaceholderText iconDef={faSpinner} text="Loading adopters..." />
            </div>
        </FullWidthPage>
    }

    function DisplayAdoptersList() {
        return <ul className="adopter-list">
            {displayAdopters.map(adopter => <li><LinkToAdopterPage adopter={adopter} /></li>)}
        </ul>
    }

    return <FullWidthPage title={"Manage Adopters"}>
        <div>
            <TextField 
                id="outlined-controlled"
                className="search-field"
                label="Filter"
                margin="dense"
                error={showError()}
                onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            />
        </div>
        <div>
            <i>
                Only adopters with an active application are searchable.<br />
                Contact Sam if you need to access inactive adopters (over one year ago or before 7/1/2024).
            </i>
        </div>
        <div className="adopter-list">
            {displayAdopters && <DisplayAdoptersList />}
            {displayAdopters.length < 1 && <PlaceholderText iconDef={faDog} text="Enter a search term to find an adopter." />}
        </div>
    </FullWidthPage>
}