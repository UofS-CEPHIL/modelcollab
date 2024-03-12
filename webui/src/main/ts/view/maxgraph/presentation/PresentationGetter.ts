import { Cell } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";
import ConnectionPresentation from "./ConnectionPresentation";
import DynamicVariablePresentation from "./DynamicVariablePresentation";
import FlowPresentation from "./FlowPresentation";
import NoModelPresentation from "./NoModelPresentation";
import ParameterPresentation from "./ParameterPresentation";
import StaticModelPresentation from "./StaticModelPresentation";
import StockPresentation from "./StockPresentation";
import SumVariablePresentation from "./SumVariablePresentation";

export default abstract class PresentationGetter {
    public abstract getRelevantPresentation(
        component: FirebaseComponent
    ): ComponentPresentation<any>;
}

export class StockFlowPresentationGetter
    extends PresentationGetter
    implements ComponentPresentation<FirebaseComponent>
{

    private static readonly PRESENTATIONS = {
        stock: new StockPresentation(),
        flow: new FlowPresentation(),
        dynvar: new DynamicVariablePresentation(),
        param: new ParameterPresentation(),
        sumvar: new SumVariablePresentation(),
        conn: new ConnectionPresentation(),
        model: new StaticModelPresentation(),
        none: new NoModelPresentation()
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
                return StockFlowPresentationGetter.PRESENTATIONS.stock;
            case ComponentType.VARIABLE:
                return StockFlowPresentationGetter.PRESENTATIONS.dynvar;
            case ComponentType.PARAMETER:
                return StockFlowPresentationGetter.PRESENTATIONS.param;
            case ComponentType.SUM_VARIABLE:
                return StockFlowPresentationGetter.PRESENTATIONS.sumvar;
            case ComponentType.FLOW:
                return StockFlowPresentationGetter.PRESENTATIONS.flow;
            case ComponentType.CONNECTION:
                return StockFlowPresentationGetter.PRESENTATIONS.conn;
            case ComponentType.STATIC_MODEL:
                return StockFlowPresentationGetter.PRESENTATIONS.model;
            case ComponentType.SUBSTITUTION:
                return StockFlowPresentationGetter.PRESENTATIONS.none;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
    }
}
