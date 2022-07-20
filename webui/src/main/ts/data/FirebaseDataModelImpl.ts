<<<<<<< HEAD:src/main/ts/data/FirebaseDataModelImpl.ts
import {
    ref,
    set,
    onValue,
    onChildAdded,
    get,
    child,
    remove,
    onChildRemoved,
    push
} from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import {
    ComponentType,
    FirebaseDataComponent,
    FlowFirebaseComponent,
    StockFirebaseComponent
} from "./FirebaseComponentModel";
=======
import { ref, set, onValue, onChildAdded, get, child, remove, onChildRemoved, DataSnapshot } from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import { FirebaseComponentModel as schema } from "database/build/export";

>>>>>>> main:webui/src/main/ts/data/FirebaseDataModelImpl.ts
import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private readonly SESSION_IDS_PATH = "/sessionIds";

    protected readonly firebaseManager: FirebaseManager;
    private sessionIds: string[];

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
        this.sessionIds = [];
        this.subscribeToSessionIds();
    }

    private subscribeToSessionIds(): void {
        const sessionsRef = ref(this.firebaseManager.getDb(), this.SESSION_IDS_PATH);
        onChildAdded(
            sessionsRef,
            (data: any) => this.sessionIds.push(data.val() as string)
        );
        onChildRemoved(
            sessionsRef,
            (data: any) =>
                this.sessionIds = this.sessionIds.filter((s: string) => s !== (data.val() as string))
        );
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

<<<<<<< HEAD:src/main/ts/data/FirebaseDataModelImpl.ts
    protected createComponent(id: string, obj: any): FirebaseDataComponent {
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

    getSessionIds(): string[] {
        return [...this.sessionIds];
    }

    updateComponent(sessionId: string, data: FirebaseDataComponent) {
=======
    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: schema.FirebaseDataComponent) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const component = schema.createFirebaseDataComponent(snapshot.key, snapshot.val());
        callback(component);
    }

    updateComponent(sessionId: string, data: schema.FirebaseDataComponent) {
>>>>>>> main:webui/src/main/ts/data/FirebaseDataModelImpl.ts
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
        callback: (newData: schema.FirebaseDataComponent) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, componentId)
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    subscribeToAllComponents(callback: (snapshot: DataSnapshot) => void) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                "components"
            ),
            callback
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

<<<<<<< HEAD:src/main/ts/data/FirebaseDataModelImpl.ts
    registerComponentCreatedListener(
        sessionId: string,
        callback: (data: FirebaseDataComponent) => void
    ) {
=======
    registerComponentCreatedListener(sessionId: string, callback: (data: schema.FirebaseDataComponent) => void) {
>>>>>>> main:webui/src/main/ts/data/FirebaseDataModelImpl.ts
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
            (snapshot: DataSnapshot) => {
                if (snapshot.key) callBack(snapshot.key);
            }
        );
    }

    renderComponents(sessionId: string, callback: (data: object) => void) {
        // todo replace this with the async version below
        get(
            child(
                ref(
                    this.firebaseManager.getDb()
                ),
                `components/${sessionId}`
            )
        ).then((snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error: Error) => {
            console.error(error);
        });
    }

<<<<<<< HEAD:src/main/ts/data/FirebaseDataModelImpl.ts
    assignSessionId() {
        const sessionIdNums = this.sessionIds.map((s: unknown) => s as number);
        const newId = Math.max(...sessionIdNums) + 1;
        const newIdRef = push(ref(this.firebaseManager.getDb(), this.SESSION_IDS_PATH));
        set(newIdRef, newId);
        return newId.toString();
=======
    async getComponentsOnce(sessionId: string): Promise<schema.FirebaseDataComponent[]> {
        function makeComponentsFromSnapshot(snap: DataSnapshot) {
            if (!snap.exists()) return [];
            const components = snap.val();
            return Object.keys(components).map(
                (k: string) => schema.createFirebaseDataComponent(k, components[k])
            );
        }

        // return new Promise((res, rej) =>
        //     onValue(
        //         ref(
        //             this.firebaseManager.getDb(),
        //             `components/${sessionId}`
        //         ),
        //         s => res(makeComponentsFromSnapshot(s)),
        //         err => rej(err),
        //         { onlyOnce: true }
        //     )
        // );
        console.log("Getting snapshot");
        const snap: DataSnapshot = await get(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}`
            )
        );
        console.log("Got snapshot.");
        return makeComponentsFromSnapshot(snap);
>>>>>>> main:webui/src/main/ts/data/FirebaseDataModelImpl.ts
    }

}
