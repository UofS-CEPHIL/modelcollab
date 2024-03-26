import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebasePointerData } from "./FirebaseComponent";

export interface FirebaseFlowData extends FirebasePointerData {
    from: string;            // ID of the source of this flow
    to: string;              // ID of the sink of this flow
    equation: string;        // The equation for the flow rate
    text: string;            // The text on screen
}

export default class FirebaseFlow
    extends FirebaseComponentBase<FirebaseFlowData>
{
    constructor(id: string, data: FirebaseFlowData) {
        super(id, data);
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

    static toFlowComponentData(data: any): FirebaseFlowData {
        const d: FirebaseFlowData = {
            from: String(data.from),
            to: String(data.to),
            text: String(data.text),
            equation: String(data.equation)
        };
        return d;
    }

    public static makePoint(x: number, y: number): string {
        return `p${x},${y}`;
    }

    public static isPoint(id: string): boolean {
        return id.startsWith('p');
    }

    public static extractPoint(id: string): { x: number, y: number } {
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
