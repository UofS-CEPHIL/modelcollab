export const enum UiMode {
    STOCK = "Stock",
    FLOW = "Flow",
    PARAM = "Param",
    DELETE = "Delete",
    MOVE = "Move",
    EDIT = "Edit",
    CONNECT = "Connect"
};

export function modeFromString(s: string): UiMode | null {
    switch (s.toUpperCase()) {
        case "STOCK":
            return UiMode.STOCK;
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
        case "CONNECT":
            return UiMode.CONNECT;
        default:
            return null;
    }
}

export class UnrecognizedModeError extends Error { }

