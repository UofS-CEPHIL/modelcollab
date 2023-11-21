import { FirebaseComponentModel as schema } from "database/build/export";

export default class IdGenerator {

    static generateUniqueId(existing: schema.FirebaseDataComponent<any>[]): string {
        let componentId: string;
        let isUsed: boolean;

        do {
            componentId = Math.floor((Math.random() * 100000) + 1).toString();
            isUsed = existing.find(
                c => c.getId() === componentId
            ) !== undefined;
        } while (isUsed);
        return componentId;
    }
}
