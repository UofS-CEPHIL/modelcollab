export default class ModelValidator {

    // Includes scientific notation using e or E, e.g. 6.022E23
    public static readonly NUMBER_REGEX = /\d+(\.\d+)?((e|E)\d+)?/g

    public static isValidParameterValue(val: string): boolean {
        const matches = val.match(this.NUMBER_REGEX);
        if (!matches || matches.length !== 1 || matches[0] !== val) {
            return false;
        }
        else if (val[0] === '0' || val.includes("E0") || val.includes("e0")) {
            return false;
        }
        return true;
    }
}
