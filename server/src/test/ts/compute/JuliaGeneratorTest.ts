import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";


//
// !!!!! HOPE YOU LIKE REGEX !!!!!
//


export default abstract class JuliaGeneratorTest {
    protected RESULTS_FILENAME = "modelResults";
    protected START_TIME_NAME = "startTime";
    protected START_TIME_VALUE = "0.0";
    protected STOP_TIME_NAME = "stopTime";
    protected STOP_TIME_VALUE = "365.0";
    protected START_TIME_COMPONENT = new JuliaParameterComponent(this.START_TIME_NAME, this.START_TIME_VALUE);
    protected STOP_TIME_COMPONENT = new JuliaParameterComponent(this.STOP_TIME_NAME, this.STOP_TIME_VALUE);
    protected NO_FLOWS_NAME = "F_NONE";
    protected NO_VARS_NAME = "V_NONE";
    protected NO_SUMVARS_NAME = "SV_NONE";
    protected EXPECTED_INCLUDES = [
        "Catlab",
        "Catlab.CategoricalAlgebra",
        "LabelledArrays",
        "OrdinaryDiffEq",
        "Plots",
        "Catlab.Graphics",
        "Catlab.Programs",
        "Catlab.Theories",
        "Catlab.WiringDiagrams",
        "StockFlow"
    ];

    public abstract describeTests(): void;
}

