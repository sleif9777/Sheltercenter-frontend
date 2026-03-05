import { useSessionState } from "../../core/session/SessionState"
import { AdopterPreferencesForm } from "../../forms/adopter/AdopterPreferenceForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"

export function AdopterPreferencesApp() {
	const session = useSessionState(),
		adopterID = session.user?.adopterID
	return (
		<FullWidthPage title="Update Preferences">
			<div className="mx-5 mt-3 flex flex-row gap-x-4 border-t border-pink-800 py-2">
				{adopterID && <AdopterPreferencesForm adopterID={adopterID} session={session} />}
			</div>
		</FullWidthPage>
	)
}
