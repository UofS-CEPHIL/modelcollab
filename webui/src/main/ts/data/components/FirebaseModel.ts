export interface ComponentSchema { }

export default abstract class FirebaseModel<T extends ComponentSchema> {
    protected uuid: string | undefined;
    protected data: T | undefined;

    public constructor(uuid?: string, data?: T) {
        this.uuid = uuid;
        this.data = data;
    }

    public getUuid(): string {
        if (!this.uuid) throw new Error("Not initialized");
        return this.uuid;
    }

    public getData(): T {
        if (!this.data) throw new Error("Not initialized");
        return { ...this.data };
    }

    public abstract empty(uuid: string, name: string, ownerUid: string): void;
}
