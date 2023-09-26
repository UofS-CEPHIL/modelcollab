import { FirebaseComponentModel as schema } from "database/build/export";
import ComponentCollection from "./components/Canvas/ComponentCollection";
import ComponentUiData from "./components/Canvas/ScreenObjects/ComponentUiData";

export default class IdGenerator {

    static generateUniqueId(existing: ComponentCollection | ComponentUiData[] | schema.FirebaseDataComponent<any>[]): string {
        let componentID: string;
        let isUsed: boolean;
        // TODO this is messy; remember to fix this up after replacing *UiData
        let components: any[];
        if (existing instanceof ComponentCollection) {
            components = existing.getAllComponentsIncludingChildren();
        }
        else {
            components = existing;
        }

        do {
            componentID = Math.floor((Math.random() * 100000) + 1).toString();
            isUsed = (components.find(c => c.getId() === componentID)) !== undefined;
        } while (isUsed);
        return componentID;
    }
}
