export class StringUtils {
    static titleCase(str: string) {
        if ((str === null) || (str === '')) {
            return '';
        }

        str = str.toString();
    
        return str.replace(/\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() +
                    txt.substr(1).toLowerCase();
            });
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

    static isNullUndefinedOrEmpty(str: string | null | undefined) {
        return (typeof str == "string")
            ? str.length <= 0
            : true
    }
}