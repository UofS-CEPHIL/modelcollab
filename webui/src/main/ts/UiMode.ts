export enum UiMode {
    STOCK = "Stock",
    FLOW = "Flow",
    PARAM = "Param",
    DYN_VARIABLE = "Dynamic Variable",
    SUM_VARIABLE = "Sum Variable",
    MOVE = "Move",
    CONNECT = "Connect",
    IDENTIFY = "Identify"
};

export function modeFromString(s: string): UiMode | null {
    switch (s.toUpperCase()) {
        case "STOCK":
            return UiMode.STOCK;
        case "FLOW":
            return UiMode.FLOW;
        case "MOVE":
            return UiMode.MOVE;
        case "PARAM":
        case "PARAMETER":
            return UiMode.PARAM;
        case "DYN_VARIABLE":
        case "DYNAMIC VARIABLE":
            return UiMode.DYN_VARIABLE;
        case "SUM VARIABLE":
            return UiMode.SUM_VARIABLE;
        case "CONNECT":
            return UiMode.CONNECT;
        case "IDENTIFY":
            return UiMode.IDENTIFY;
        default:
            return null;
    }
}

export class UnrecognizedModeError extends Error { }
