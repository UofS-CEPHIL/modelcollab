import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
import FirebasePointerComponent from "./FirebasePointerComponent";
import FirebaseMovableLabelPointerComponent, { FirebaseMovableLabelPointerData } from "./FirebaseMovableLabelPointerComponent";
import FirebaseStaticModel from "./FirebaseStaticModel";

export type FirebaseFlowData = FirebaseMovableLabelPointerData
    & { equation: string };

export default class FirebaseFlow
    extends FirebaseMovableLabelPointerComponent<FirebaseFlowData>
{

    public getType(): ComponentType {
        return ComponentType.FLOW;
    }

    public withData(d: Partial<FirebaseFlowData>) {
        FirebasePointerComponent.sanitizePointerData(d);
        return new FirebaseFlow(
            this.getId(),
            {
                ...this.getData(),
                ...d
            }
        );
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

    public asChildOf(
        parent: FirebaseStaticModel,
        dx: number,
        dy: number,
    ): FirebaseFlow {
        const updatePoint = (p: string) => {
            const oldpoint = FirebaseFlow.extractPointFromId(p);
            return FirebaseFlow.makePoint(
                oldpoint.x - dx,
                oldpoint.y - dy
            );
        }
        let child = super.asChildOf(parent, dx, dy) as FirebaseFlow;
        const { from, to } = this.getData();
        return child.withData({
            ...child.getData(),
            from: FirebaseFlow.isPoint(from)
                ? updatePoint(from)
                : parent.makeChildId(from),
            to: FirebaseFlow.isPoint(to)
                ? updatePoint(to)
                : parent.makeChildId(to)
        });
    }

    public static toFlowComponentData(data: any): FirebaseFlowData {
        const ul = FirebaseMovableLabelPointerComponent.UNINITIALIZED_LABEL_POS;
        const d: FirebaseFlowData = {
            from: String(data.from),
            to: String(data.to),
            points: data.points ?? [],
            text: String(data.text ?? ""),
            equation: String(data.equation ?? ""),
            bold: Boolean(data.bold ?? false),
            italic: Boolean(data.italic ?? false),
            underline: Boolean(data.underline ?? false),
            fontSize: Number(
                data.fontSize
                ?? theme.custom.maxgraph.textComponent.defaultFontSize
            ),
            color: String(data.color ?? theme.palette.canvas.contrastText),
            labelX: Number(data.labelX ?? ul),
            labelY: Number(data.labelY ?? ul),
        };
        FirebasePointerComponent.sanitizePointerData(d);
        return d;
    }

    public static createNew(
        id: string,
        from: string,
        to: string
    ): FirebaseFlow {
        const ul = FirebaseMovableLabelPointerComponent.UNINITIALIZED_LABEL_POS;
        return new FirebaseFlow(
            id,
            {
                from,
                to,
                text: "Flow",
                equation: "",
                points: [],
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                bold: false,
                underline: false,
                italic: false,
                color: theme.palette.canvas.contrastText,
                labelX: ul,
                labelY: ul,
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
                c.getData().from && isSameId(c.getData().from, source)
                && c.getData().to && isSameId(c.getData().to, target)
            )
        ) return false;
        return true;
    }
}
