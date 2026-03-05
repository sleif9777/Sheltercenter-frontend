import { StandardCard } from "../../core/components/card/Card"
import { CardColor } from "../../core/components/card/CardEnums"
import { ImportSpreadsheetBatchForm } from "../../forms/users/ImportSpreadsheetBatchForm"
import { UserForm } from "../../forms/users/UserForm"
import { UserFormContext } from "../../forms/users/UserFormState"
import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"

export function AdopterUploadApp() {
	return (
		<FullWidthPage title="Upload Adopters">
			<div className="mx-5 mt-3 flex flex-row gap-x-4 border-t border-pink-800 py-2">
				<StandardCard
					className="rounded-lg"
					color={CardColor.BLUE}
					description="Upload New Batch"
					maxWidth="w-[50%]"
					whiteBg
				>
					<ImportSpreadsheetBatchForm />
				</StandardCard>
				<StandardCard
					className="rounded-lg"
					color={CardColor.PINK}
					description="Add New Adopter"
					maxWidth="w-[50%]"
					whiteBg
				>
					<UserForm context={UserFormContext.NEW} />
				</StandardCard>
			</div>
		</FullWidthPage>
	)
}
