import { Cell, EventObject, InternalEvent } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import StockFlowGraph from "./StockFlowGraph";

// This class contains the logic for making changes to the diagram, including
// the positions of the components and their values. This component is
// responsible for making sure that the firebase state, the local state of
// Firebase components (i.e. by using setCurrentComponents), and the local Graph
// representation
//
// Actions are almost always performed by first updating Firebase and allowing
// the change to propagate via the listeners. The only exceptions to this are
// ones that must be triggered by performing actions on individual graph cells,
// such as moving or resizing an existing component. In such cases, we set up
// listeners for the event and update Firebase within them.
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
            (s: EventSource, o: EventObject) => this.onCellsMoved(s, o)
        );
        this.graph.addListener(
            InternalEvent.CELLS_RESIZED,
            () => null // TODO
        );
    }

    public addComponent(component: schema.FirebaseDataComponent<any>): void {
        // "update" and "add" are the same thing in Firebase
        this.updateComponent(component);
    }

    public moveComponents(
        updatedComponents: schema.FirebaseDataComponent<any>[],
        clouds: Cell[],
        dx: number,
        dy: number
    ): void {
        const allComponents = this.getCurrentComponents();
        const verticesToUpdate = updatedComponents.filter(
            c => c instanceof schema.PointFirebaseComponent
        );
        const updatedFlows = clouds.length > 0
            ? this.moveFlowClouds(clouds, allComponents, dx, dy)
            : allComponents.filter(c => c instanceof schema.FlowFirebaseComponent);

        const others = allComponents.filter(
            c => !(
                verticesToUpdate.find(v => v.getId() === c.getId())
                || updatedFlows.find(f => f.getId() === c.getId())
            )
        );
        const updatedVertices = verticesToUpdate.map(v =>
            (v as schema.PointFirebaseComponent<any>).withUpdatedLocation(dx, dy)
        );
        this.fbData.setAllComponents(
            this.sessionId,
            [...updatedVertices, ...updatedFlows, ...others]
        );
    }

    public updateComponent(component: schema.FirebaseDataComponent<any>): void {
        this.fbData.updateComponent(this.sessionId, component);
    }

    public deleteSelection(): void {
        const selectedComponents = this.graph!.getSelectionCells();
        if (selectedComponents.length > 0) {
            const selectedIds = selectedComponents.map(c => c.getId()!);
            const allComponents = this.getCurrentComponents();
            this.fbData.removeComponents(
                this.sessionId,
                selectedIds,
                allComponents
            );
        }
    }

    public deleteComponent(component: schema.FirebaseDataComponent<any>): void {
        this.fbData.removeComponent(this.sessionId, component.getId());
    }

    private moveFlowClouds(
        clouds: Cell[],
        allComponents: schema.FirebaseDataComponent<any>[],
        dx: number,
        dy: number
    ): schema.FlowFirebaseComponent[] {

        interface CloudUpdate {
            source: boolean,
            flowId: string,
            newX: number,
            newY: number
        };

        function makePointString(x: number, y: number): string {
            return `p${x},${y}`;
        }

        function makeCloudUpdate(cloud: Cell): CloudUpdate {
            const id = cloud.getId()!;
            const idsplit = id.split('.');
            const geo = cloud.getGeometry()!;
            return {
                source: idsplit[1] === "from",
                flowId: idsplit[0],
                newX: geo.x,
                newY: geo.y
            };
        }

        const updates = clouds.map(makeCloudUpdate);
        const updatedFlows = allComponents
            .filter(c => c instanceof schema.FlowFirebaseComponent)
            .map(c => c.clone());
        for (const update of updates) {
            const idx = updatedFlows.findIndex(f => f.getId() === update.flowId);
            if (idx < 0) throw new Error("Couldn't find flow " + update.flowId);
            const oldData = updatedFlows[idx].getData();
            const pointString = makePointString(update.newX, update.newY);
            var newData;
            if (update.source) {
                newData = { ...oldData, from: pointString };
            }
            else {
                newData = { ...oldData, to: pointString };
            }
            updatedFlows[idx] = updatedFlows[idx].withData(newData);
        }

        return updatedFlows;
    }

    private onFbDataChanged(
        newComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const oldComponents = this.getCurrentComponents();
        this.setCurrentComponents(newComponents);
        this.graph.refreshComponents(newComponents, oldComponents);
    }

    private onCellsMoved(_: EventSource, event: EventObject): void {
        const dx = event.properties["dx"];
        const dy = event.properties["dy"];
        const cells: Cell[] = event.properties["cells"];

        const isCloudId = (id: string) => id.includes('.');
        const clouds = cells.filter(cell => isCloudId(cell.getId()!));

        const components = cells
            .filter(c => !isCloudId(c.getId()!))
            .map(c => c.getId()!)
            .map(id => this.getComponentWithId(id)!);
        this.moveComponents(components, clouds, dx, dy);
    }

    private getComponentWithId(
        id: string
    ): schema.FirebaseDataComponent<any> | undefined {
        return this.getCurrentComponents().find(c => c.getId() === id);
    }
}
