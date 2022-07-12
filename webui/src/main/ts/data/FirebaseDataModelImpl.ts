import { getDatabase, ref, set, onValue, onChildAdded, get, child, remove, onChildRemoved } from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import { ComponentType, FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent } from "./FirebaseComponentModel";

import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

    private triggerCallback(
        snapshot: any,
        callback: (data: FirebaseDataComponent) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const data = snapshot.val().data;
        const componentType = snapshot.val().type;
        let component: FirebaseDataComponent;
        switch (componentType) {
            case ComponentType.STOCK.toString():
                component = new StockFirebaseComponent(
                    snapshot.key,
                    {
                        x: data.x as number,
                        y: data.y as number,
                        text: data.text as string,
                        initvalue: data.initvalue as string
                    }
                );
                break;
            case ComponentType.FLOW.toString():
                component = new FlowFirebaseComponent(
                    snapshot.key,
                    {
                        from: data.from as string,
                        to: data.to as string,
                        equation: data.equation as string,
                        text: data.text as string,
                        dependsOn: data.dependsOn as string[]
                    }
                );
                break;
            default:
                throw new Error("Unknown component type: " + componentType);
        }
        callback(component);
    }

    updateComponent(sessionId: string, data: FirebaseDataComponent) {
        set(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, data.getId())
            ),
            {
                type: data.getType().toString(),
                data: data.getData()
            }
        );
    }

    subscribeToComponent(
        sessionId: string,
        componentId: string,
        callback: (newData: FirebaseDataComponent) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, componentId)
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    removeComponent(sessionId: string, componentId: string) {
        const componentPath = this.makeComponentPath(sessionId, componentId);
        remove(
            ref(
                this.firebaseManager.getDb(),
                componentPath
            )
        );
    }

    registerComponentCreatedListener(sessionId: string, callback: (data: FirebaseDataComponent) => void) {
        onChildAdded(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    registerComponentRemovedListener(sessionId: string, callBack: (componentId: string) => void) {
        onChildRemoved(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            (snapshot) => {
                if (snapshot.key) callBack(snapshot.key);
            }
        );
    }

    renderComponents(sessionId: string, callback: (data: object) => void) {
        get(
            child(
                ref(
                    this.firebaseManager.getDb()
                ),
                `components/${sessionId}`
            )
        ).then((snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

}
