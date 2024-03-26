import ComponentType from "./ComponentType";

// Represents any object that acts as the "data" field for any FirebaseDataComponent
export interface FirebaseDataObject { };

export interface FirebasePointerData {
    from: string,
    to: string
};

export abstract class FirebaseEntityBase<DataType extends FirebaseDataObject> {
    public abstract toFirebaseEntry(): [string, Object];
    public abstract withData(d: DataType): FirebaseEntityBase<DataType>;

    protected readonly id: string;
    protected readonly data: DataType;

    constructor(id: string, data: DataType) {
        this.id = id;
        this.data = data;
    }

    public getId(): string {
        return this.id;
    };

    public getData(): DataType {
        return this.data;
    }

    public toString() {
        return `FirebaseEntity: id = ${this.getId()}, `
            + `data = ${Object.entries(this.getData())}`;
    }
}


// Represents all components as they are represented inside Firebase
export abstract class FirebaseComponentBase
    <DataType extends FirebaseDataObject>
    extends FirebaseEntityBase<DataType> {

    public getContainingModelId(): string | undefined {
        const idSplit = this.getId().split('/');
        if (idSplit.length === 1) return undefined;
        else return idSplit.slice(0, idSplit.length - 1).join('/');
    }

    public clone(): FirebaseComponentBase<DataType> {
        return this.withId(this.getId());
    }

    public equals(other: FirebaseComponent): boolean {
        // https://stackoverflow.com/questions/201183/how-can-i-determine-equality-for-two-javascript-objects
        function deepEquals(x: any, y: any): boolean {
            const ok = Object.keys, tx = typeof x, ty = typeof y;
            return x && y && tx === 'object' && tx === ty ? (
                ok(x).length === ok(y).length &&
                ok(x).every(key => deepEquals(x[key], y[key]))
            ) : (x === y);
        }

        return other.getType() === this.getType()
            && deepEquals(this.getData(), other.getData());
    }

    public toFirebaseEntry(): [string, { type: string, data: any }] {
        return [
            this.getId(),
            {
                "type": this.getType(),
                "data": this.getData()
            }
        ];
    }

    public abstract getType(): ComponentType;
    public abstract withId(id: string): FirebaseComponentBase<DataType>;
    public abstract withData(d: DataType): FirebaseComponentBase<DataType>;
    public abstract getReadableComponentName(): string;
    public abstract getLabel(): string | null;
}

type FirebaseComponent = FirebaseComponentBase<any>;
export type FirebaseEntity = FirebaseEntityBase<any>

export default FirebaseComponent;
