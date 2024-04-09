import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";

export default class FirebaseConnection
    extends FirebasePointerComponent<FirebasePointerData>
{
    public constructor(id: string, data: FirebasePointerData) {
        super(id, data);
    }

    public isLabelMovable(): boolean {
        return false;
    }

    public getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    public withData(d: FirebasePointerData): FirebaseConnection {
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
                points: []
            }
        );
    }

    public static toConnectionComponentData(data: any): FirebasePointerData {
        const d: FirebasePointerData = {
            from: data.from.toString(),
            to: data.to.toString(),
            points: data.points ?? [],
        };
        FirebasePointerComponent.sanitizePointerData(d);
        return d;
    }
}
