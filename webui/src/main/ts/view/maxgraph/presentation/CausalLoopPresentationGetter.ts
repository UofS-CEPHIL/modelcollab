import { Cell } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import CausalLoopLinkPresentation from "./CausalLoopLinkPresentation";
import CausalLoopVertexPresentation from "./CausalLoopVertexPresentation";
import ComponentPresentation from "./ComponentPresentation";
import LoopIconPresentation from "./LoopIconPresentation";
import PresentationGetter from "./PresentationGetter";
import StickyNotePresentation from "./StickyNotePresentation";

export default class CausalLoopPresentationGetter
    extends PresentationGetter
    implements ComponentPresentation<FirebaseComponent>
{

    private static readonly PRESENTATIONS = {
        vertex: new CausalLoopVertexPresentation(),
        link: new CausalLoopLinkPresentation(),
        stickynote: new StickyNotePresentation(),
        icon: new LoopIconPresentation()
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
            case ComponentType.CLD_VERTEX:
                return CausalLoopPresentationGetter.PRESENTATIONS.vertex;
            case ComponentType.CLD_LINK:
                return CausalLoopPresentationGetter.PRESENTATIONS.link;
            case ComponentType.STICKY_NOTE:
                return CausalLoopPresentationGetter.PRESENTATIONS.stickynote;
            case ComponentType.LOOP_ICON:
                return CausalLoopPresentationGetter.PRESENTATIONS.icon;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
    }
}
