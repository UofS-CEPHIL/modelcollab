export interface FirebaseColorProperties {
    color: string;
}

export interface FirebaseMovableLabelProperties {
    labelX: number;
    labelY: number;
}

export interface FirebasePointerProperties {
    from: string;
    to: string;
    points: { x: number; y: number }[];
    entryX?: number;
    entryY?: number;
    exitX?: number;
    exitY?: number;
};

export interface FirebaseTextProperties {
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    text: string;
}
