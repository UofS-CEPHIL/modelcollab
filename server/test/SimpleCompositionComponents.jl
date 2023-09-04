# This file contains a simple example of composition
# [ param sumvar S1 => S2 =]> S3 => back to S1
# param contributes to S1S2 and S3S1
# sumvar contributes to S2S3, doesn't contribute to any inner components
# S2 and S3 contribute to sumvar
# S1 and S2 contribute to S1S2 flow
# S2 and S3 contribute to S2S3 flow
# S3 contributes to S3S1 flow
# No stocks have any dependencies
# S3 and sumvar are composed. Param only exists in inner model.

S1_NAME = "S1"
S1_ID = "0"
S1_INIT_VALUE = "12.0"
S2_NAME = "S2"
S2_ID = "1"
S2_INIT_VALUE = "432.0"
S3_NAME = "S3"
S3_ID = "2"
S3_INIT_VALUE = "0.0"

SUM_VAR_NAME = "SUMVAR"
SUM_VAR_ID = "222"
PARAM_NAME = "P"
PARAM_VALUE = "1"
PARAM_ID = "333"
INNER_MODEL_ID = "inner"
OUTER_MODEL_ID = "outer"
START_TIME_ID = "444"
START_TIME_NAME = "startTime"
START_TIME_VALUE = "0.0"
STOP_TIME_ID = "555"
STOP_TIME_NAME = "stopTime"
STOP_TIME_VALUE = "1000.0"

S1S2_NAME = "S1S2"
S1S2_EQUATION = "($(S1_NAME) + $(S2_NAME)) * $(PARAM_NAME)"
S1S2_EXPECTED_EQUATION = "(u.$(S1_NAME) + u.$(S2_NAME)) * p.$(PARAM_NAME)"
S1S2_ID = "3"
S2S3_NAME = "S2S3"
S2S3_EQUATION = "( (S2 + 10.0001) * S3) + $(SUM_VAR_NAME)"
S2S3_EXPECTED_EQUATION = "( (u.S2 + 10.0001) * u.S3) + uN.$(SUM_VAR_NAME)(u, t)"
S2S3_ID = "4"
S3S1_NAME = "S3S1"
S3S1_EQUATION = "$(S3_NAME) * 0.0001"
S3S1_EXPECTED_EQUATION = "u.$(S3_NAME) * 0.0001"
S3S1_ID = "5"

S1::Stock = Stock(
    S1_NAME,
    S1_ID,
    S1_INIT_VALUE,
    [S3S1_NAME],
    [S1S2_NAME],
    Vector{String}(),
    Vector{String}(),
    Vector{String}(),
    [S1S2_NAME]
)
S2::Stock = Stock(
    S2_NAME,
    S2_ID,
    S2_INIT_VALUE,
    [S1S2_NAME],
    [S2S3_NAME],
    Vector{String}(),
    [SUM_VAR_NAME],
    Vector{String}(),
    [S2S3_NAME, S1S2_NAME]
)
S3::Stock = Stock(
    S3_NAME,
    S3_ID,
    S3_INIT_VALUE,
    [S2S3_NAME],
    [S3S1_NAME],
    Vector{String}(),
    [SUM_VAR_NAME],
    Vector{String}(),
    [S3S1_NAME, S2S3_NAME]
)
S1S2::Flow = Flow(
    S1S2_NAME,
    S1S2_ID,
    S1_NAME,
    S2_NAME,
    S1S2_EQUATION,
    [S1_NAME, S2_NAME],
    Vector{String}()
)
S2S3::Flow = Flow(
    S2S3_NAME,
    S2S3_ID,
    S2_NAME,
    S3_NAME,
    S2S3_EQUATION,
    [S2_NAME, S3_NAME],
    [SUM_VAR_NAME]
)
S3S1::Flow = Flow(
    S3S1_NAME,
    S3S1_ID,
    S3_NAME,
    S1_NAME,
    S3S1_EQUATION,
    [S3_NAME],
    Vector{String}()
)
START_TIME::Parameter = Parameter(
    START_TIME_NAME,
    START_TIME_ID,
    START_TIME_VALUE
)
STOP_TIME::Parameter = Parameter(
    STOP_TIME_NAME,
    STOP_TIME_ID,
    STOP_TIME_VALUE
)
PARAM::Parameter = Parameter(
    PARAM_NAME,
    PARAM_ID,
    PARAM_VALUE
)
SUMVAR::SumVariable = SumVariable(
    SUM_VAR_NAME,
    SUM_VAR_ID,
    [S2_NAME, S3_NAME]
)

OUTER_MODEL::StockFlowModel = StockFlowModel(
    OUTER_MODEL_ID,
    [S1, S2, S3],
    [S2S3, S3S1],
    [START_TIME, STOP_TIME],
    Vector{DynamicVariable}(),
    [SUMVAR]
)

INNER_MODEL::StockFlowModel = StockFlowModel(
    INNER_MODEL_ID,
    [S1, S2],
    [S1S2],
    [PARAM],
    Vector{DynamicVariable}(),
    [SUMVAR]
)
PATH = "/some/path"


S1_FOOT::Foot = Foot(S1_NAME, Vector{String}(), [INNER_MODEL_ID, OUTER_MODEL_ID])
S2_FOOT::Foot = Foot(S2_NAME, [SUM_VAR_NAME],  [INNER_MODEL_ID, OUTER_MODEL_ID])
S3_FOOT::Foot = Foot(S3_NAME, [SUM_VAR_NAME], [OUTER_MODEL_ID])
