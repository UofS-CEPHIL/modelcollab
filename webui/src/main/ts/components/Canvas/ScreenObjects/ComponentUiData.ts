import { FirebaseComponentModel as schema } from "database/build/export";

export abstract class ComponentUiDataExtensible
    <
    DataType extends schema.FirebaseDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>
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

    public getType(): schema.ComponentType {
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

