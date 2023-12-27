import FirebaseComponent from "./data/components/FirebaseComponent";

export default class IdGenerator {

    static generateUniqueId(existing: FirebaseComponent[]): string {
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
