import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import ComponentPresentation from "./ComponentPresentation";
import ConnectionPresentation from "./ConnectionPresentation";
import DynamicVariablePresentation from "./DynamicVariablePresentation";
import FlowPresentation from "./FlowPresentation";
import NoModelPresentation from "./NoModelPresentation";
import ParameterPresentation from "./ParameterPresentation";
import StaticModelPresentation from "./StaticModelPresentation";
import StockPresentation from "./StockPresentation";
import SumVariablePresentation from "./SumVariablePresentation";

export default class PresentationGetter {

    private static readonly stock = new StockPresentation();
    private static readonly flow = new FlowPresentation();
    private static readonly dynvar = new DynamicVariablePresentation();
    private static readonly param = new ParameterPresentation();
    private static readonly sumvar = new SumVariablePresentation();
    private static readonly conn = new ConnectionPresentation();
    private static readonly model = new StaticModelPresentation();
    private static readonly none = new NoModelPresentation();

    public static getRelevantPresentation(
        component: FirebaseComponent
    ): ComponentPresentation<any> {
        switch (component.getType()) {
            case ComponentType.STOCK:
                return PresentationGetter.stock;
            case ComponentType.VARIABLE:
                return PresentationGetter.dynvar;
            case ComponentType.PARAMETER:
                return PresentationGetter.param;
            case ComponentType.SUM_VARIABLE:
                return PresentationGetter.sumvar;
            case ComponentType.FLOW:
                return PresentationGetter.flow;
            case ComponentType.CONNECTION:
                return PresentationGetter.conn;
            case ComponentType.STATIC_MODEL:
                return PresentationGetter.model;
            case ComponentType.SUBSTITUTION:
                return PresentationGetter.none;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
    }
}
