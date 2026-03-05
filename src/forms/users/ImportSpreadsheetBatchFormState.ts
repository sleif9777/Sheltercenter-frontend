import { ImportSpreadsheetBatchRequest } from "../../api/users/Requests"
import { createFormState, FormFieldUpdateCallback } from "../FormState"

export type ImportSpreadsheetBatchFormFieldUpdater = FormFieldUpdateCallback<ImportSpreadsheetBatchRequest>

const initialState: ImportSpreadsheetBatchRequest = {
	importFile: null,
}

export const useImportSpreadsheetBatchFormState = createFormState<ImportSpreadsheetBatchRequest>(initialState, {
	importFile: [
		(s) => s.importFile != null || "Must have an import file",
		(s) =>
			["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"].includes(
				s.importFile?.type ?? ""
			) || "Must upload an XLSX or CSV file",
	],
})
