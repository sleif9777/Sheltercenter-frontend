import FullWidthPage from "../../../../layouts/FullWidthPage/FullWidthPage";
import "./UploadAdoptersApp.scss"
import { UploadDocument } from "./components/UploadDocument";
import { AdopterForm } from "../../shared_components/AdopterForm";

export function UploadAdoptersApp() {
    return <FullWidthPage 
        title="Upload Adopters"  
    >
        <UploadDocument />
        <hr />
        <AdopterForm context="Upload" />
    </FullWidthPage>
}