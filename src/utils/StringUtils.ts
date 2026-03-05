export class StringUtils {
	static titleCase(str: string) {
		if (str === null || str === "") {
			return ""
		}

		str = str.toString()

		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		})
	}

	static phoneNumber(str: string) {
		if (str.length == 0) {
			return ""
		}

		const areaCode = str.slice(2, 5)
		const prefix = str.slice(5, 8)
		const lineNumber = str.slice(8, 12)

		return `(${areaCode}) ${prefix}-${lineNumber}`
	}

	static isNull(str?: string) {
		return str === null || str?.length == 0
	}

	static isNotNull(str?: string) {
		return (str?.length ?? 0) > 0
	}

	static oxfordJoin(items: string[]): string {
		if (items.length === 0) return ""
		if (items.length === 1) return items[0]
		if (items.length === 2) return `${items[0]} and ${items[1]}`
		return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
	}
}
