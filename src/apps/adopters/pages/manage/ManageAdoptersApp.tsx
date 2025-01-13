import { useEffect, useState } from "react"
import { TextField } from "@mui/material"
import { faDog } from "@fortawesome/free-solid-svg-icons"
import { AxiosResponse } from "axios"
import LinkToAdopterPage from "./components/LinkToAdopterPage"
import { IAdopter, Adopter } from "../../models/Adopter"
import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage"
import PlaceholderText from "../../../../layouts/PlaceholderText/PlaceholderText"
import { AdopterAPI } from "../../api/API"
import "./ManageAdoptersApp.scss"

export default function ManagerAdoptersApp() {
    const fetchData = async () => {
        const response: AxiosResponse<{adopters: IAdopter[]}> = await new AdopterAPI().GetAllAdopters()
        setAllAdopters(response.data.adopters.map(adopter => new Adopter(adopter)))
    }

    const [allAdopters, setAllAdopters] = useState<Adopter[]>([])
    const [displayAdopters, setDisplayAdopters] = useState<Adopter[]>([])
    const [filterText, setFilterText] = useState<string>("")
    
    const showError = () => {
        return filterText.length < 3 && (displayAdopters.length == 0)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (filterText.length < 3) {
            setDisplayAdopters([])
        }
        setDisplayAdopters(
            allAdopters
                .filter(adopter => adopter.matchesSearch(filterText ?? ""))
                .sort((a, b) => a.fullName.localeCompare(b.fullName))
            )
    }, [filterText])

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
            <i>Only adopters with an active application are searchable.<br />Contact Sam if you need to access inactive adopters (over one year ago).</i>
        </div>
        <div className="adopter-list">
            {displayAdopters
                ? <ul className="adopter-list">
                    {displayAdopters.map(adopter => <li>
                        <LinkToAdopterPage adopter={adopter} />
                    </li>)}
                </ul>
                : null
            }
            {showError() ? <PlaceholderText iconDef={faDog} text="Enter a search term to find an adopter." /> : null}
        </div>
    </FullWidthPage>
}