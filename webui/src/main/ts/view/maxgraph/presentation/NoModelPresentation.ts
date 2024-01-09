import { Cell } from "@maxgraph/core";
import { FirebaseSubstitution } from "../../../data/components/FirebaseSubstitution";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

type InvisibleComponent = FirebaseSubstitution;

// "Presentation" for components that aren't shown
export default class NoModelPresentation
    implements ComponentPresentation<InvisibleComponent>
{
    public addComponent(
        _: InvisibleComponent,
        __: StockFlowGraph,
        ___?: Cell | undefined,
        ____?: ((name: string) => void) | undefined,
        _____?: boolean | undefined
    ): Cell | Cell[] {
        return [];
    }

    public updateCell(
        _: InvisibleComponent,
        __: Cell,
        ___: StockFlowGraph,
        ____: LoadedStaticModel[] | undefined
    ): void {
        // Do nothing
    }

    public updateComponent(
        _: InvisibleComponent,
        __: Cell,
        ___?: StockFlowGraph | undefined
    ): InvisibleComponent {
        throw new Error("Method not applicable.");
    }

}
