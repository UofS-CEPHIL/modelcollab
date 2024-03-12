import { Cell, EventObject } from "@maxgraph/core";
import FirebaseComponent from "../../data/components/FirebaseComponent";
import FirebaseFlow from "../../data/components/FirebaseFlow";
import FirebasePointComponent from "../../data/components/FirebasePointComponent";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import { LoadedStaticModel } from "../Screens/StockFlowScreen";
import DiagramActions from "./DiagramActions";
import ComponentPresentation from "./presentation/ComponentPresentation";
import PresentationGetter from "./presentation/PresentationGetter";
import StockFlowGraph from "./StockFlowGraph";

export default class StockFlowDiagramActions
    extends DiagramActions<StockFlowGraph>
{

    private getLoadedStaticModels: () => LoadedStaticModel[];

    public constructor(
        fbData: FirebaseDataModel,
        graph: StockFlowGraph,
        modelUuid: string,
        getCurrentComponents: () => FirebaseComponent[],
        getLoadedStaticModels: () => LoadedStaticModel[]
    ) {
        super(fbData, graph, modelUuid, getCurrentComponents);
        this.getLoadedStaticModels = getLoadedStaticModels;
    }

    protected getPresentation<T extends FirebaseComponent>(
        cpt: T
    ): ComponentPresentation<T> {
        return PresentationGetter.getRelevantPresentation(cpt);
    }

    // Override to handle clouds
    protected onCellsMoved(_: EventSource, event: EventObject): void {
        const dx = event.properties["dx"];
        const dy = event.properties["dy"];
        const cells: Cell[] = event.properties["cells"];

        const isCloudId = (id: string) => id.includes('.');
        const clouds = cells.filter(cell => isCloudId(cell.getId()!));
        const components = cells
            .filter(c => !isCloudId(c.getId()!))
            .map(c => c.getId()!)
            .map(id => this.getComponentWithIdOrThrow(id));
        this.moveComponents(components, clouds, dx, dy);
    }

    public moveComponents(
        updatedComponents: FirebaseComponent[],
        clouds: Cell[],
        dx: number,
        dy: number
    ): void {
        const allComponents = this.getCurrentComponents();
        const verticesToUpdate = updatedComponents.filter(
            c => c instanceof FirebasePointComponent
        );
        const updatedFlows = clouds.length > 0
            ? this.moveFlowClouds(clouds, allComponents)
            : allComponents.filter(
                c => c instanceof FirebaseFlow
            );

        const others = allComponents.filter(
            c => !(
                verticesToUpdate.find(v => v.getId() === c.getId())
                || updatedFlows.find(f => f.getId() === c.getId())
            )
        );
        const updatedVertices = verticesToUpdate.map(v =>
            (v as FirebasePointComponent<any>)
                .withUpdatedLocation(dx, dy)
        );
        this.fbData.setAllComponents(
            this.modelUuid,
            [...updatedVertices, ...updatedFlows, ...others]
        );
    }


    private moveFlowClouds(
        clouds: Cell[],
        allComponents: FirebaseComponent[]
    ): FirebaseFlow[] {

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
            .filter(c => c instanceof FirebaseFlow)
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
}
