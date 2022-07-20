import { DataContainer } from "./data/DataContainer";
import { FirebaseComponentModel as schema } from "database/build/export";

export default class IdGenerator {

    // TODO: generate random number. If that number is not already in
    // use, reserve it by adding an object for that ID filled with
    // arbitrary data (can we do this atomically? Otherwise could lead
    // to invalid state though unlikely). If it is in use, restart.

    generateSessionId() {
        return 1;
    }

    generateComponentId(data: DataContainer) {

        const compareID = (componentID: schema.FirebaseDataComponent, newComponentID: number): boolean => {
            return componentID.getId() === newComponentID.toString();
        }

        let componentID: number;
        let isUsed: boolean;
        do {
            componentID = Math.floor((Math.random() * 100) + 1);
            isUsed = false;

            for (let i = 0; i < data.getStocks().length; i++) {
                if (compareID(data.getStocks()[i], componentID)) {
                    isUsed = true;
                    break;
                }
            }

            if (!isUsed) {
                for (let i = 0; i < data.getFlows().length; i++) {
                    if (compareID(data.getFlows()[i], componentID)) {
                        isUsed = true;
                        break;
                    }
                }
            }
        } while (isUsed)

        return componentID;
    }
}
