
export interface Point {
    x: number;
    y: number;
}

export enum Side {
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    TOP = "TOP",
    BOTTOM = "BOTTOM",
}

export function getOppositeSide(side: Side): Side {
    switch (side) {
        case Side.TOP:
            return Side.BOTTOM;
        case Side.BOTTOM:
            return Side.TOP;
        case Side.LEFT:
            return Side.RIGHT;
        case Side.RIGHT:
            return Side.LEFT;
    }
}

