import { AxiosResponse } from "axios"
import { useState } from "react"
import { SubmissionButton } from "../../../../../components/forms/SubmissionButton"
import { Message, MessageLevel } from "../../../../../components/message/Message"
import { IAdopter } from "../../../models/Adopter"
import { UserProfilesAPI } from "../../../../login/api/API"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"

export function UploadDocument() {
    const [importFile, setImportFile] = useState<File>()
    const [errorMsg, setErrorMsg] = useState<string>("")
	const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false)
    const [showProgressMsg, setShowProgressMsg] = useState<boolean>(false)
    const [postUploadMsg, setPostUploadMsg] = useState<string>("")
    const [showPostUploadMsg, setShowPostUploadMsg] = useState<boolean>(false)
    const [aversionsMsg, setAversionsMsg] = useState<JSX.Element>()
    const [postUploadMsgLevel, setPostUploadMsgLevel] = useState<MessageLevel>("Default")

	const doSpreadsheetImportBatch = async () => {
        if (!importFile) { return }

        setShowProgressMsg(true)

        const response: AxiosResponse = await new UserProfilesAPI().SpreadsheetImportBatch(importFile)
        const { successes, updates, failures, aversions }: { 
            successes: number, 
            updates: number, 
            failures: number,
            aversions: IAdopter[] 
        } = response.data
        var messageComponents = []

        if (successes > 0) {
            messageComponents.push(`${successes} created`)
        }

        if (updates > 0) {
            messageComponents.push(`${updates} updated`)
        }

        if (failures > 0) {
            messageComponents.push(`${failures} failed`)
        }

        setPostUploadMsg(messageComponents.join(", "))
        setShowProgressMsg(false)
        setShowPostUploadMsg(true)

        if ((failures > 0 || aversions.length > 0) && (successes + updates) == 0) {
            setPostUploadMsgLevel("Error")
        } else if (failures > 0 || aversions.length > 0) {
            setPostUploadMsgLevel("Warning")
        } else {
            setPostUploadMsgLevel("Success")
        }

        if (aversions.length > 0) {
            setAversionsMsg(() => {
                const msgText = <>
                    <span>Some adopters were previously blocked. Review and update manually:</span>
                    <ul>
                        {aversions.map(a => <li>
                            <a href={`/adopters/manage/${a.ID}`} target="_blank">{a.fullName}</a>
                        </li>)}
                    </ul>
                </>

                return <Message 
                    level="Error"
                    message={msgText}
                    showMessage={true}
                />
            })
        } else {
            setAversionsMsg(<></>)
        }
	}

    const validFileType = (file: File) => {
        return [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ].includes(file.type)
	}

	const handleErrorMessage = (file: File | undefined) => {
		if (!file) {
			setErrorMsg("You must choose a file to import.")
			setShowErrorMsg(true)
		} else if (!validFileType(file)) {
			setErrorMsg("You must choose a CSV or XLSX file.")
			setShowErrorMsg(true)
		} else {
			setErrorMsg("")
			setShowErrorMsg(false)
		}
	}

    return <>
        <div id="separator" />
        <form>
            {/* TODO: SEGREGATE THIS INTO A GENERIC FILE UPLOAD COMPONENT */}
            <label 
                htmlFor="batchUpload" 
                className="large-button"
            >
                Import File
            </label>
            <input
                id="batchUpload"
                type="file"
                onClick={() => setShowErrorMsg(false)}
                onChange={(e) => {
                    setImportFile(
                        e.target.files
                            ? e.target.files[0]
                            : undefined
                    )
                    setShowPostUploadMsg(false)
                    handleErrorMessage(e.target.files ? e.target.files[0] : undefined)
                }}
            /><br />
            <div className="file-name">
                {importFile ? importFile.name : "No file chosen"}
            </div>
            {/* END TODO */}
        </form>
        <Message level={"Inline-Error"} message={errorMsg} showMessage={showErrorMsg} />
        <SubmissionButton 
            disabled={!importFile || !validFileType(importFile)} 
            extendOnSubmit={doSpreadsheetImportBatch} 
        />
        <Message level="Default" message={"Upload in progress..."} showMessage={showProgressMsg} icon={faSpinner} />
        <Message level={postUploadMsgLevel} message={postUploadMsg} showMessage={showPostUploadMsg} />
        {aversionsMsg}
    </>
}