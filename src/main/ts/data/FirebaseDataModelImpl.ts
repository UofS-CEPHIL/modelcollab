import {
    ref,
    set,
    onValue,
    onChildAdded,
    get,
    child,
    remove,
    onChildRemoved
} from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import {
    ComponentType,
    FirebaseDataComponent,
    FlowFirebaseComponent,
    StockFirebaseComponent
} from "./FirebaseComponentModel";
import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

    private createComponent(id: string, obj: any): FirebaseDataComponent {
        const data = obj.data;
        const componentType = obj.type;
        let component: FirebaseDataComponent;
        switch (componentType) {
            case ComponentType.STOCK.toString():
                component = new StockFirebaseComponent(
                    id,
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
                    id,
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
        return component;
    }

    private triggerCallback(
        snapshot: any,
        callback: (data: FirebaseDataComponent) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const component = this.createComponent(snapshot.key, snapshot.val());
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

    async getAllSessionIds() {
        return await get(
            ref(this.firebaseManager.getDb(), "/sessions"),
        ).then(
            snapshot => {
                if (snapshot.exists()) {
                    return snapshot.val().keys();
                }
                else {
                    throw new Error("Unable to find session IDs");
                }
            }
        );
    }

    async getAllComponentIds(sessionId: string) {
        return (await get(
            ref(this.firebaseManager.getDb(), `/components/${sessionId}`)
        )).val().keys();
    }

    async getComponentData(
        sessionId: string,
        componentId: string
    ): Promise<FirebaseDataComponent> {

        const path: string = this.makeComponentPath(sessionId, componentId);
        const snapshot = await get(
            ref(
                this.firebaseManager.getDb(),
                path
            )
        );
        if (!snapshot || !snapshot.key || !snapshot.val()) {
            throw new Error("Unable to find component at path ${path}.");
        }
        return this.createComponent(
            snapshot.key,
            snapshot.val()
        );
    }

    registerComponentCreatedListener(
        sessionId: string,
        callback: (data: FirebaseDataComponent) => void
    ) {
        onChildAdded(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            x => this.triggerCallback(x, callback)
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
