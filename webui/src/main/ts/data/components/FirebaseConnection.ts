import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebasePointerData } from "./FirebaseComponent";

export interface FirebaseConnectionData extends FirebasePointerData {
    from: string, // The component from which the connection starts
    to: string    // The component to which the connection goes
    handleXOffset: number;   // The X offset of the handle from the centre of the line
    handleYOffset: number;   // The Y offset of the handle from the centre of the line
}

export default class FirebaseConnection
    extends FirebaseComponentBase<FirebaseConnectionData>
{
    public constructor(id: string, data: FirebaseConnectionData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    public withData(d: FirebaseConnectionData): FirebaseConnection {
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
                handleXOffset: 0,
                handleYOffset: 0
            }
        );
    }

    public static toConnectionComponentData(data: any): FirebaseConnectionData {
        const d: FirebaseConnectionData = {
            from: data.from.toString(),
            to: data.to.toString(),
            handleXOffset: Number(data.handleXOffset),
            handleYOffset: Number(data.handleYOffset)
        };
        return d;
    }
}
