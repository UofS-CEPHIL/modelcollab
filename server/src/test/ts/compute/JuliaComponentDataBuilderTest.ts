import { FirebaseComponentModel as schema } from "database/build/export";

export abstract class JuliaComponentDataBuilderTest {

    public abstract describeTests(): void;

    protected static STOCK1_ID = "0";
    protected static STOCK1_NAME = "Stock";
    protected static STOCK1 = new schema.StockFirebaseComponent(
        this.STOCK1_ID,
        { x: 0, y: 0, initvalue: "1", text: this.STOCK1_NAME }
    );
    protected static STOCK2_ID = "1";
    protected static STOCK2_NAME = "Stock2";
    protected static STOCK2 = new schema.StockFirebaseComponent(
        this.STOCK2_ID,
        { x: 0, y: 0, initvalue: "2", text: this.STOCK2_NAME }
    );

    protected static FLOW_ID = "2";
    protected static FLOW_NAME = "Flow";
    protected static FLOW = new schema.FlowFirebaseComponent(
        this.FLOW_ID,
        { from: this.STOCK1_ID, to: this.STOCK2_ID, text: this.FLOW_NAME, equation: "0.01" }
    );

    protected static PARAM1_ID = "3";
    protected static PARAM1_NAME = "Param";
    protected static PARAM1 = new schema.ParameterFirebaseComponent(
        this.PARAM1_ID,
        { x: 0, y: 0, text: this.PARAM1_NAME, value: "10000" }
    );
    protected static PARAM2_ID = "4";
    protected static PARAM2_NAME = "Param2";
    protected static PARAM2 = new schema.ParameterFirebaseComponent(
        this.PARAM2_ID,
        { x: 0, y: 0, text: this.PARAM2_NAME, value: "9999" }
    );

    protected static SUMVAR_ID = "5";
    protected static SUMVAR_NAME = "SumVar";
    protected static SUMVAR = new schema.SumVariableFirebaseComponent(
        this.SUMVAR_ID,
        { x: 0, y: 0, text: this.SUMVAR_NAME }
    );

    protected static DYNVAR_ID = "6";
    protected static DYNVAR_NAME = "DynVar";
    protected static DYNVAR = new schema.VariableFirebaseComponent(
        this.DYNVAR_ID,
        { x: 0, y: 0, text: this.DYNVAR_NAME, value: "8766" }
    );

}
