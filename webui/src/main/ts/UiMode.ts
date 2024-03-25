export enum UiMode {
    MOVE = "Move",
    STOCK = "Stock",
    FLOW = "Flow",
    PARAM = "Param",
    DYN_VARIABLE = "Dynamic Variable",
    SUM_VARIABLE = "Sum Variable",
    CONNECT = "Connect",
    IDENTIFY = "Identify",
    EDIT = "Edit",
    STICKY_NOTE = "Sticky Note",
    LOOP_ICON = "Loop Icon",
    DELETE = "Delete"
};

export function modeFromString(s: string): UiMode | null {
    switch (s.toUpperCase()) {
        case "MOVE":
            return UiMode.MOVE;
        case "STOCK":
            return UiMode.STOCK;
        case "FLOW":
            return UiMode.FLOW;
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
        case "EDIT":
            return UiMode.EDIT;
        case "STICKY NOTE":
            return UiMode.STICKY_NOTE;
        case "LOOP ICON":
            return UiMode.LOOP_ICON;
        case "DELETE":
            return UiMode.DELETE;
        default:
            return null;
    }
}

export class UnrecognizedModeError extends Error { }
