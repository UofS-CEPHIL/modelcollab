import ComponentCollection from "./components/Canvas/ComponentCollection";
import ComponentUiData from "./components/Canvas/ScreenObjects/ComponentUiData";

export default class IdGenerator {

    static generateUniqueId(existing: ComponentCollection | ComponentUiData[]): string {
        let componentID: string;
        let isUsed: boolean;
        let components: ComponentUiData[];
        if (existing instanceof ComponentCollection) {
            components = existing.getAllComponents();
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
