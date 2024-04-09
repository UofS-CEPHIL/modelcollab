import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
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
        FirebasePointerComponent.sanitizePointerData(d);
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
        FirebasePointerComponent.sanitizePointerData(d);
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

    public static isCloudId(id: string): boolean {
        const regex = /^\d+\.(from|to)$/;
        return regex.test(id);
    }

    public static getFlowIdFromCloudId(cloudId: string): string {
        if (!FirebaseFlow.isCloudId(cloudId))
            throw new Error("Invalid cloud id: " + cloudId);
        return cloudId.split('.')[0];
    }

    public static canConnect(
        source: FirebaseComponent | null,
        target: FirebaseComponent | null,
        allComponents: FirebaseComponent[]
    ): boolean {
        const isSameId = (id: string, c: FirebaseComponent | null) => {
            if (this.isPoint(id)) return c === null;
            else if (c === null) return false;
            else {
                return c.getId() === id;
            }
        }

        if (!source && !target) return false;
        if (source && source.getType() !== ComponentType.STOCK) return false;
        if (target && target.getType() !== ComponentType.STOCK) return false;
        if (source && target && source.getId() === target.getId()) return false;
        if (allComponents
            .find(c =>
                isSameId(c.getData().from, source)
                && isSameId(c.getData().to, target)
            )
        ) return false;
        return true;
    }
}
