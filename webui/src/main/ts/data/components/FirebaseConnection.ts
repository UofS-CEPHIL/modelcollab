import ComponentType from "./ComponentType";
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
        if (data.entryX) d.entryX = data.entryX;
        if (data.entryY) d.entryY = data.entryY;
        if (data.exitX) d.exitX = data.exitX;
        if (data.exitY) d.exitY = data.exitY;
        return d;
    }
}
