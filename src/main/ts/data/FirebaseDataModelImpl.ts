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
