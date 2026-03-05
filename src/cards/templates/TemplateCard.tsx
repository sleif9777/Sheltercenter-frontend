import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { useCallback } from "react"

import { StandardCard } from "../../core/components/card/Card"
import { CardActionAreYouSure } from "../../core/components/card/CardActionAreYouSure"
import { CardActionSection } from "../../core/components/card/CardActionSection"
import { CardColor } from "../../core/components/card/CardEnums"
import { HashTemplate } from "../../models/TemplateModels"
import { useTemplateState } from "../../pages/template/TemplateAppState"
import { TemplatesAPI } from "../../api/templates/TemplatesAPI"

export function TemplateCard({ template, timeDisplay }: { template: HashTemplate; timeDisplay: string }) {
	return (
		<StandardCard
			actions={
				<CardActionSection color={CardColor.BLUE}>
					<DeleteButton templateID={template.ID} />
				</CardActionSection>
			}
			color={CardColor.BLUE}
			description={`${template.typeDisplay} at ${timeDisplay}`} // TODO: fix and show time
			hideTitleBorder
		/>
	)
}

function DeleteButton({ templateID }: { templateID: number }) {
	const template = useTemplateState()

	const handleDelete = useCallback(async () => {
		if (!templateID) {
			return
		}

		await new TemplatesAPI().DeleteTemplate(templateID)
		template.refresh()
	}, [template, templateID])

	return (
		<CardActionAreYouSure
			icon={faTrash}
			modalTitle="Delete Template"
			youWantTo="delete this template"
			onSubmit={handleDelete}
		/>
	)
}
