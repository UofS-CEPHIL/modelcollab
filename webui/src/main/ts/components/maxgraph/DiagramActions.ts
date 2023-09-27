import { FirebaseComponentModel as schema } from "database/build/export";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import StockFlowGraph from "./StockFlowGraph";

// This class contains the logic for making changes to the diagram, including
// the positions of the components and their values. This component is
// responsible for making sure that the firebase state and the local diagram
// view stay up-to-date. This happens by first updating Firebase when an edit
// occurs, then allowing the Firebase callback function to propagate those
// changes into the on-screen graph, same as if the change happened remotely
export default class DiagramActions {

    private fbData: FirebaseDataModel;
    private graph: StockFlowGraph;
    private sessionId: string;
    private setCurrentComponents: (c: schema.FirebaseDataComponent<any>[]) => void;

    public constructor(
        fbData: FirebaseDataModel,
        graph: StockFlowGraph,
        sessionId: string,
        setCurrentComponents: (c: schema.FirebaseDataComponent<any>[]) => void
    ) {
        this.fbData = fbData;
        this.graph = graph;
        this.sessionId = sessionId;
        this.setCurrentComponents = setCurrentComponents;
        this.fbData.subscribeToSession(
            this.sessionId,
            newComponents => this.onFbDataChanged(newComponents)
        );
    }

    public onFbDataChanged(newComponents: schema.FirebaseDataComponent<any>[]): void {
        this.setCurrentComponents(newComponents);
        this.graph.updateComponents(newComponents);
    }

    public deleteComponent(componentId: string): void {
        this.fbData.removeComponent(this.sessionId, componentId);
    }

    public addComponent(component: schema.FirebaseDataComponent<any>): void {
        this.updateComponent(component);
    }

    public updateComponent(component: schema.FirebaseDataComponent<any>): void {
        this.fbData.updateComponent(this.sessionId, component);
    }

}
