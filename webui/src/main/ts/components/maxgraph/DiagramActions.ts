import { InternalEvent } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import StockFlowGraph from "./StockFlowGraph";

// This class contains the logic for making changes to the diagram, including
// the positions of the components and their values. This component is
// responsible for making sure that the firebase state, the local state of
// Firebase components (i.e. by using setCurrentComponents), and the local Graph
// representation
//
// The actions that are performed on the graph (add a component, change its
// size, delete a component, etc.) are triggered by first editing the graph,
// then propagating the action to Firebase in a listener. Actions that don't
// need to be reflected in the graph and/or don't originate from the graph
// (e.g. change a Stock starting value) happen by directly interacting with
// Firebase and setCurrentComponents
export default class DiagramActions {

    private fbData: FirebaseDataModel;
    private graph: StockFlowGraph;
    private sessionId: string;
    private setCurrentComponents: (c: schema.FirebaseDataComponent<any>[]) => void;
    private getCurrentComponents: () => schema.FirebaseDataComponent<any>[];

    public constructor(
        fbData: FirebaseDataModel,
        graph: StockFlowGraph,
        sessionId: string,
        setCurrentComponents: (c: schema.FirebaseDataComponent<any>[]) => void,
        getCurrentComponents: () => schema.FirebaseDataComponent<any>[]
    ) {
        this.fbData = fbData;
        this.graph = graph;
        this.sessionId = sessionId;
        this.setCurrentComponents = setCurrentComponents;
        this.getCurrentComponents = getCurrentComponents;

        // Subscribe to remote updates from Firebase
        this.fbData.subscribeToSession(
            this.sessionId,
            newComponents => this.onFbDataChanged(newComponents)
        );

        // Listen for graph actions and update Firebase when they happen. This
        // is only for actions that don't originate from "UserControls" and
        // instead come from the graph directly, such as cells moved or resized.
        this.graph.addListener(
            InternalEvent.CELLS_MOVED,
            () => null // TODO
        );
        this.graph.addListener(
            InternalEvent.CELLS_RESIZED,
            () => null // TODO
        );
    }

    public onFbDataChanged(
        newComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const oldComponents = this.getCurrentComponents();
        this.setCurrentComponents(newComponents);
        this.graph.refreshComponents(newComponents, oldComponents);
    }

    public addComponents(components: schema.FirebaseDataComponent<any>[]): void {
        // TODO add multiple components at once
    }

    public addComponent(component: schema.FirebaseDataComponent<any>): void {
        // "update" and "add" are the same thing in Firebase
        this.updateComponent(component);
    }

    public updateComponent(component: schema.FirebaseDataComponent<any>): void {
        this.fbData.updateComponent(this.sessionId, component);
    }

    public deleteSelection(): void {
        const selectedComponents = this.graph!.getSelectionCells();
        if (selectedComponents.length > 0) {
            const selectedIds = selectedComponents.map(c => c.getId()!);
            const allComponents = this.getCurrentComponents();
            this.fbData.removeComponents(this.sessionId, selectedIds, allComponents);
        }
    }

    public deleteComponent(component: schema.FirebaseDataComponent<any>): void {
        this.fbData.removeComponent(this.sessionId, component.getId());
    }
}
