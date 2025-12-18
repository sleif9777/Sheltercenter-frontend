import { useStore } from "zustand";

import Logo from "../../assets/logo.png"
import { useSessionState } from "../../session/SessionState";
import PageButton from "./PageButton";

import "./NavigationApp.scss"

export function NavigationApp() {
    const session = useStore(useSessionState)
    
    function CalendarButton() {
        return <PageButton 
            caption="Calendar"    
            route="/calendar/"
            mobileSupported
        />
    }

    function WeeklyTemplateButton() {
        if (session.adminUser) {
            return <PageButton 
                caption="Weekly Template"    
                route="/calendar_template/"
            />
        }
    }

    function UploadAdoptersButton() {
        if (session.adminUser) {
            return <PageButton 
                caption="Upload Adopters"
                route="/adopters/upload/"
            />
        }
    }

    function ManageAdoptersButton() {
        if (session.adminUser) {
            return <PageButton 
                caption="Manage Adopters"
                route="/adopters/manage/"
            />
        }
    }

    function ChosenBoardButton() {
        if (session.adminUser) {
            return <PageButton 
                caption="Chosen Board"
                route="/chosen_board/"
                mobileSupported
            />
        }
    }

    function InProgressAppointmentsButton() {
        if (!session.adopterUser) {
            return <PageButton 
                caption="In Progress Appts"
                route="/in_progress/"
            />
        }
    }

    function PrivacyPolicyButton() {
        return <PageButton
            mobileSupported
            caption="Privacy Policy"
            route="/privacy/"
        />
    }

    function RecentUploadsButton() {
        if (session.adminUser) {
            return <PageButton
                caption="Recent Uploads"
                route="/recent_uploads/"
            />
        }
    }

    function SignOutButton() {
        return <PageButton
            isLast
            extendOnClick={() => session.logOut(session.userID)}
            caption="Sign Out"
            mobileSupported
        />
    }

    return <div className="navbar">
        <div className="navbar-element">
            <a href="https://savinggracenc.org/" className="logo">
                <img src={Logo} alt="" />
            </a>
        </div>
        <div id="all-elements">
            <CalendarButton />
            <WeeklyTemplateButton />
            <UploadAdoptersButton />
            <ManageAdoptersButton />
            <ChosenBoardButton/>
            <InProgressAppointmentsButton />
            <PrivacyPolicyButton />
            <RecentUploadsButton />
            <SignOutButton />
        </div>
    </div>
}