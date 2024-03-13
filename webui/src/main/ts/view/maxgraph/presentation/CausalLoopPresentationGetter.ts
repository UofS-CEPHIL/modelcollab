import { Cell } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";
import ConnectionPresentation from "./ConnectionPresentation";
import PresentationGetter from "./PresentationGetter";
import StockPresentation from "./StockPresentation";

export default class CausalLoopPresentationGetter
    extends PresentationGetter
    implements ComponentPresentation<FirebaseComponent>
{

    // TODO customize this presentation
    private static readonly PRESENTATIONS = {
        stock: new StockPresentation(),
        conn: new ConnectionPresentation(),
    }

    public addComponent(
        component: FirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        loadStaticModelComponents?: ((name: string) => void),
        movable?: boolean
    ): Cell | Cell[] {
        return this
            .getRelevantPresentation(component)
            .addComponent(
                component,
                graph,
                parent,
                loadStaticModelComponents,
                movable
            );
    }

    public updateCell(
        component: FirebaseComponent,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModels?: LoadedStaticModel[]
    ): void {
        return this
            .getRelevantPresentation(component)
            .updateCell(component, cell, graph, loadedModels);
    }


    public updateComponent(
        component: FirebaseComponent,
        cell: Cell,
        graph?: MCGraph
    ) {
        return this
            .getRelevantPresentation(component)
            .updateComponent(component, cell, graph);
    }

    public getRelevantPresentation(
        component: FirebaseComponent
    ): ComponentPresentation<any> {
        switch (component.getType()) {
            case ComponentType.STOCK:
                return CausalLoopPresentationGetter.PRESENTATIONS.stock;
            case ComponentType.CONNECTION:
                return CausalLoopPresentationGetter.PRESENTATIONS.conn;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
    }
}
