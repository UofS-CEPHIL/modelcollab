import ComponentType from "database/build/ComponentType";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";
import FirebaseDataObject from "database/build/FirebaseDataObject";

export abstract class ComponentUiDataExtensible
    <
    DataType extends FirebaseDataObject,
    DbObject extends FirebaseDataComponent<DataType>
    >
{

    private readonly dbObject: DbObject;

    public abstract withData(data: DataType): ComponentUiDataExtensible<DataType, DbObject>;
    public abstract withId(id: string): ComponentUiDataExtensible<DataType, DbObject>;
    public abstract isVisible(): boolean;

    public constructor(dbObject: DbObject) {
        this.dbObject = dbObject;
    }

    public getId(): string {
        return this.dbObject.getId();
    }

    public getType(): ComponentType {
        return this.dbObject.getType();
    }

    public getData(): DataType {
        return this.dbObject.getData();
    }

    public getDatabaseObject(): DbObject {
        return this.dbObject;
    }

    public toString(): string {
        return this.getDatabaseObject().toString();
    }
}

export default abstract class ComponentUiData extends ComponentUiDataExtensible<any, any> { }

