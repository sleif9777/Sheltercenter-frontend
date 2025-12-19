import { Route } from "react-router-dom";

import AdopterDetailsApp from "../../apps/adopters/pages/detail/AdopterDetailsApp";
import ManagerAdoptersApp from "../../apps/adopters/pages/manage/ManageAdoptersApp";
import RecentUploadsApp from "../../apps/adopters/pages/recent_uploads/RecentUploadsApp";
import { UploadAdoptersApp } from "../../apps/adopters/pages/upload/UploadAdoptersApp";
import { ChosenBoardApp } from "../../apps/pending_adoptions/ChosenBoardApp";
import { PrivacyPolicyApp } from "../../apps/privacy/PrivacyPolicyApp";
import CalendarApp from "../../apps/scheduling/pages/calendar/CalendarApp";
import DailyReportApp from "../../apps/scheduling/pages/daily_report/DailyReportApp";
import InProgressAppointmentsApp from "../../apps/scheduling/pages/in_progress_report/InProgressAppointmentsApp";
import PrintViewApp from "../../apps/scheduling/pages/print_view/PrintViewApp";
import { WeeklyTemplateApp } from "../../apps/scheduling/pages/template/WeeklyTemplateApp";

export const AllRoutes = <>
    <Route
        element={<CalendarApp />}
        index
    />
    <Route
        element={<CalendarApp />}
        path="/calendar"
    />
    <Route
        element={<WeeklyTemplateApp />}
        path="/calendar_template/"
    />
    <Route
        element={<PrintViewApp />}
        path="/print_view/:date/"
    />
    <Route
        element={<DailyReportApp />}
        path="/daily_report/:date/"
    />
    <Route
        element={<UploadAdoptersApp />}
        path="/adopters/upload/"
    />
    <Route
        element={<ManagerAdoptersApp />}
        path="/adopters/manage/"
    />
    <Route
        element={<AdopterDetailsApp />}
        path="/adopters/manage/:id"
    />
    <Route
        element={<ChosenBoardApp />}
        path="/chosen_board/"
    />
    <Route
        element={<InProgressAppointmentsApp />}
        path="/in_progress/"
    />
    <Route
        element={<RecentUploadsApp />}
        path="/recent_uploads/"
    />
    <Route
        element={<PrivacyPolicyApp />}
        path="/privacy/"
    />
</>