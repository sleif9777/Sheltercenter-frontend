/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactQuill from "react-quill"

/**
 * Extracts wildcards in the format $$$LABEL$$$ from a Quill delta
 */
export function extractWildcardsFromDelta(content: ReactQuill.Value | undefined): string[] {
    if (!content) {
        return []
    }

    const found = new Set<string>()
    const ops = (content as any)?.ops

    if (!ops || !Array.isArray(ops)) {
        return []
    }

    ops.forEach((op: any) => {
        if (typeof op.insert === "string") {
            const matches = op.insert.match(/\$\$\$[^$]+\$\$\$/g)
            if (matches) {
                matches.forEach((match: string) => found.add(match))
            }
        }
    })

    return Array.from(found)
}

/**
 * Replaces wildcards in a Quill delta with provided values
 */
export function replaceWildcardsInDelta(content: ReactQuill.Value | undefined, wildcardValues: Record<string, string>): ReactQuill.Value {
    if (!content) {
        return ""
    }

    const ops = (content as any)?.ops
    if (!ops || !Array.isArray(ops)) {
        return ""
    }

    const newOps = ops.map((op: any) => {
        if (typeof op.insert === "string") {
            let newInsert = op.insert

            Object.entries(wildcardValues).forEach(([wildcard, value]) => {
                if (value) {
                    newInsert = newInsert.replace(new RegExp(wildcard.replace(/\$/g, "\\$"), "g"), value)
                }
            })

            return {
                ...op,
                insert: newInsert,
            }
        }
        return op
    })

    return { ops: newOps } as ReactQuill.Value
}

/**
 * Converts a Quill delta to plain text
 */
export function deltaToPlainText(content: ReactQuill.Value | undefined): string {
    if (!content) return ""

    if (typeof content === "string") return content

    const ops = (content as any)?.ops
    if (!ops || !Array.isArray(ops)) return ""

    return ops
        .map((op: any) => {
            if (typeof op.insert === "string") {
                return op.insert
            }
            return ""
        })
        .join("")
}

/**
 * Converts plain text back to a simple Quill delta
 */
export function plainTextToDelta(text: string): ReactQuill.Value {
    return {
        ops: [{ insert: text }],
    } as ReactQuill.Value
}
