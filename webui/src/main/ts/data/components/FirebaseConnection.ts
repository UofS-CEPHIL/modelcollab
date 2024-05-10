import { theme } from "../../Themes";
import { FirebaseColorProperties } from "../FirebaseProperties";
import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";

export type FirebaseConnectionData = FirebasePointerData
    & FirebaseColorProperties;

export default class FirebaseConnection
    extends FirebasePointerComponent<FirebaseConnectionData>
{
    public constructor(id: string, data: FirebaseConnectionData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    public withData(d: FirebaseConnectionData): FirebaseConnection {
        FirebasePointerComponent.sanitizePointerData(d);
        return new FirebaseConnection(this.getId(), d);
    }

    public withId(id: string): FirebaseConnection {
        return new FirebaseConnection(id, Object.assign({}, this.getData()));
    }

    public getReadableComponentName(): string {
        return `Connection (#${this.getId()})`;
    }

    public getLabel(): string | null {
        return null;
    }

    public static canConnect(
        source: FirebaseComponent | null,
        target: FirebaseComponent | null,
        allComponents: FirebaseComponent[],
    ): boolean {
        if (
            !source
            || !target
            || target.getType() === ComponentType.PARAMETER
            || target.getType() === ComponentType.CONNECTION
            || source.getType() === ComponentType.FLOW
            || source.getType() === ComponentType.CONNECTION
            || source.getId() === target.getId()
            || allComponents.find(c =>
                c.getType() === ComponentType.CONNECTION
                && c.getData().from === source.getId()
                && c.getData().to === target.getId())
        ) {
            return false;
        }

        return true;
    }

    public static createNew(
        id: string,
        from: string,
        to: string
    ): FirebaseConnection {
        return new FirebaseConnection(
            id,
            {
                from,
                to,
                points: [],
                color: theme.custom.maxgraph.arrowComponent.defaultColor,
            }
        );
    }

    public static toConnectionComponentData(data: any): FirebaseConnectionData {
        const d: FirebaseConnectionData = {
            from: data.from.toString(),
            to: data.to.toString(),
            points: data.points ?? [],
            color: String(data.color) ?? theme.custom.maxgraph.connection,
        };
        FirebasePointerComponent.sanitizePointerData(d);
        return d;
    }
}
