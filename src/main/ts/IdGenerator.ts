import { FirebaseDataComponent} from "./data/FirebaseComponentModel";

export default class IdGenerator {

    // TODO: generate random number. If that number is not already in
    // use, reserve it by adding an object for that ID filled with
    // arbitrary data (can we do this atomically? Otherwise could lead
    // to invalid state though unlikely). If it is in use, restart.
    
    generateSessionId() {
        return 1;
    }

    generateComponentId(stocks: FirebaseDataComponent[], flows: FirebaseDataComponent[]) {

        const compareID = ( componentID: FirebaseDataComponent, newComponentID: number): boolean => {
            return componentID.getId() === newComponentID.toString();
        }

        let componentID: number; 
        let isUsed: boolean;       
        do {
            componentID = Math.floor(Math.random() * 100);
            isUsed = false;       

            for (let i = 0; i < stocks.length; i++){
                if (compareID(stocks[i],componentID)){
                    isUsed = true;
                    break;
                }
            }

            if (!isUsed){
                for (let i = 0; i < flows.length; i++){
                    if (compareID(flows[i],componentID)){
                        isUsed = true;
                        break;
                    }
                }
            }
        }
        while( isUsed )
        
        return componentID;
    }
}
