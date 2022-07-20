import { onValue, ref } from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import { FirebaseDataComponent } from "./FirebaseComponentModel";
import FirebaseDataModelImpl from "./FirebaseDataModelImpl";
import FirebaseTestingDataModel from "./FirebaseTestingDataModel";

export default class FirebaseTestingDataModelImpl extends FirebaseDataModelImpl implements FirebaseTestingDataModel {

    private readonly DEFAULT_WAIT_TIME_MS = 5000;

    private readonly seleniumDriver: any;

    constructor(firebaseMgr: FirebaseManager, seleniumDriver: any) {
        super(firebaseMgr);
        this.seleniumDriver = seleniumDriver;
    }

    async getComponents(sessionId: string) {
        let components: FirebaseDataComponent[] | null = null;
        onValue(
            ref(this.firebaseManager.getDb(), `/components/${sessionId}`),
            (snapshot: any) => {
                const componentsObj: any = snapshot.val() || {};
                components = Object.keys(componentsObj)
                    .map(k => this.createComponent(k, componentsObj[k]));
            },
            { onlyOnce: true }
        );
        this.seleniumDriver.wait(() => components !== null, this.DEFAULT_WAIT_TIME_MS);
        return components || [];
    }
}
