export enum UiMode {
    STOCK = "Stock",
    FLOW = "Flow",
    PARAM = "Param",
    DYN_VARIABLE = "Dynamic Variable",
    SUM_VARIABLE = "Sum Variable",
    DELETE = "Delete",
    MOVE = "Move",
    EDIT = "Edit",
    CONNECT = "Connect",
    CLOUD = "Cloud",
    IDENTIFY = "Identify"
};

export function modeFromString(s: string): UiMode | null {
    switch (s.toUpperCase()) {
        case "STOCK":
            return UiMode.STOCK;
        case "CLOUD":
            return UiMode.CLOUD;
        case "FLOW":
            return UiMode.FLOW;
        case "MOVE":
            return UiMode.MOVE;
        case "EDIT":
            return UiMode.EDIT;
        case "DELETE":
            return UiMode.DELETE;
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

