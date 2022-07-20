export const enum UiMode {
    STOCK = "Stock",
    DELETE = "Delete",
    MOVE = "Move",
    FLOW = "Flow",
    EDIT = "Edit"
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
        default:
            return null;
    }
}

export class UnrecognizedModeError extends Error { }

