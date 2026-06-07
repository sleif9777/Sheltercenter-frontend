import { useSessionState } from "../../core/session/SessionState"
import { AdopterPreferencesForm } from "../../forms/adopter/AdopterPreferenceForm"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import { usePageTitle } from "../../utils/usePageTitle"

export function AdopterPreferencesApp() {
	usePageTitle("My Preferences")
	const session = useSessionState(),
		adopterID = session.user?.adopterID
	return (
		<FullWidthPage title="Update Preferences">
			<div className="mx-auto mt-3 w-full max-w-3xl border-t border-pink-800 px-5 py-4">
				{adopterID && <AdopterPreferencesForm adopterID={adopterID} session={session} />}
			</div>
		</FullWidthPage>
	)
}
