import ComponentType from "./ComponentType";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";

export interface FirebaseFlowData extends FirebasePointerData {
    equation: string;
    text: string;
}

export default class FirebaseFlow
    extends FirebasePointerComponent<FirebaseFlowData>
{
    constructor(id: string, data: FirebaseFlowData) {
        super(id, data);
    }

    public isLabelMovable(): boolean {
        return true;
    }

    public getType(): ComponentType {
        return ComponentType.FLOW;
    }

    public withData(d: FirebaseFlowData) {
        return new FirebaseFlow(this.getId(), d);
    }

    public withId(id: string): FirebaseFlow {
        return new FirebaseFlow(id, Object.assign({}, this.getData()));
    }

    public getReadableComponentName(): string {
        return `${this.getData().text} (#${this.getId()})`;
    }

    public getLabel(): string | null {
        return this.getData().text;
    }

    public static toFlowComponentData(data: any): FirebaseFlowData {
        const d: FirebaseFlowData = {
            from: String(data.from),
            to: String(data.to),
            points: data.points ?? [],
            text: String(data.text),
            equation: String(data.equation)
        };
        if (data.entryX) d.entryX = data.entryX;
        if (data.entryY) d.entryY = data.entryY;
        if (data.exitX) d.exitX = data.exitX;
        if (data.exitY) d.exitY = data.exitY;
        return d;
    }

    public static createNew(
        id: string,
        from: string,
        to: string
    ): FirebaseFlow {
        return new FirebaseFlow(
            id,
            {
                from,
                to,
                text: "",
                equation: "",
                points: [],
            }
        );
    }

    public static makePoint(x: number, y: number): string {
        return `p${x},${y}`;
    }

    public static isPoint(id: string): boolean {
        return id.startsWith('p');
    }

    public static extractPointFromId(id: string): { x: number, y: number } {
        const regex = /p(?<x>\d+),(?<y>\d+)/;
        const match = id.match(regex);
        if (!match)
            throw new Error(`Unable to extract point from string ${id}`);
        return { x: +match.groups!.x, y: +match.groups!.y };
    }

    public static makeCloudId(flowId: string, isSource: boolean): string {
        const suffix = isSource ? "from" : "to";
        return `${flowId}.${suffix}`;
    }
}
