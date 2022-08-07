import { FirebaseComponentModel as schema } from "database/build/export";
import ComponentUiData from "./components/ScreenObjects/ComponentUiData";

export default class IdGenerator {

    // TODO: generate random number. If that number is not already in
    // use, reserve it by adding an object for that ID filled with
    // arbitrary data (can we do this atomically? Otherwise could lead
    // to invalid state though unlikely). If it is in use, restart.

    static generateSessionId(): string {
        return "1";
    }

    static generateUniqueId(existing: ReadonlyArray<ComponentUiData>): string {
        let componentID: string;
        let isUsed: boolean;
        do {
            componentID = Math.floor((Math.random() * 100000) + 1).toString();
            isUsed = (existing.find(c => c.getId() === componentID)) !== undefined;
        } while (isUsed);
        return componentID;
    }
}
