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

function qualify_id(id::String)::String
    return "$(INNER_MODEL_ID)_$(id)"
end

SUM_VAR_NAME = "SUMVAR"
SUM_VAR_ID = "222"
PARAM_NAME = "P"
PARAM_VALUE = "1"
PARAM_EXPECTED_VALUE = "1.0"
PARAM_ID = "333"
INNER_MODEL_ID = "inner"
OUTER_MODEL_ID = "_outer"

S1_NAME = "S1"
S1_ID = "0"
S1_INIT_VALUE = PARAM_NAME
S1_EXPECTED_VALUE = "params.$(PARAM_NAME)"
S2_NAME = "S2"
S2_ID = "1"
S2_INIT_VALUE = "432.0"
S2_EXPECTED_VALUE = S2_INIT_VALUE
S3_NAME = "S3"
S3_ID = "2"
S3_INIT_VALUE = "0.0"
S3_EXPECTED_VALUE = S3_INIT_VALUE

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

############################# Firebase Components ##############################

FB_S1_INNER::FirebaseStock = FirebaseStock(
    qualify_id(S1_ID),
    FirebasePoint(100.3, 201.1), # arbitrary
    FirebaseText(S1_NAME),
    FirebaseValue(S1_INIT_VALUE),
    STOCK
)
FB_S1_OUTER::FirebaseStock = newid(S1_ID, FB_S1_INNER)

FB_S2_OUTER::FirebaseStock = FirebaseStock(
    S2_ID,
    FirebasePoint(999.999, 888.888),
    FirebaseText(S2_NAME),
    FirebaseValue(S2_INIT_VALUE),
    STOCK
)
FB_S2_INNER::FirebaseStock = newid(qualify_id(S2_ID), FB_S2_OUTER)

FB_S3::FirebaseStock = FirebaseStock(
    S3_ID,
    FirebasePoint(99.1123, 999.1),
    FirebaseText(S3_NAME),
    FirebaseValue(S3_INIT_VALUE),
    STOCK
)

FB_S1S2::FirebaseFlow = FirebaseFlow(
    qualify_id(S1S2_ID),
    FirebasePointer(S1_ID, S2_ID),
    FirebaseValue(S1S2_EQUATION),
    FirebaseText(S1S2_NAME),
    FLOW
)

FB_S2S3::FirebaseFlow = FirebaseFlow(
    S2S3_ID,
    FirebasePointer(S2_ID, S3_ID),
    FirebaseValue(S2S3_EQUATION),
    FirebaseText(S2S3_NAME),
    FLOW
)

FB_S3S1::FirebaseFlow = FirebaseFlow(
    S3S1_ID,
    FirebasePointer(S3_ID, S1_ID),
    FirebaseValue(S3S1_EQUATION),
    FirebaseText(S3S1_NAME),
    FLOW
)

FB_SUMVAR_INNER::FirebaseSumVariable = FirebaseSumVariable(
    qualify_id(SUM_VAR_ID),
    FirebasePoint(88.99, 3333.4444),
    FirebaseText(SUM_VAR_NAME),
    SUM_VARIABLE
)
FB_SUMVAR_OUTER::FirebaseSumVariable = newid(SUM_VAR_ID, FB_SUMVAR_INNER)

FB_PARAM::FirebaseParameter = FirebaseParameter(
    qualify_id(PARAM_ID),
    FirebasePoint(101.222, 333.444),
    FirebaseText(PARAM_NAME),
    FirebaseValue(PARAM_VALUE),
    PARAMETER
)

# Connections
PS1S2_CONN_ID = qualify_id("10")
PS1S2_CONN = FirebaseConnection(
    PS1S2_CONN_ID,
    FirebasePointer(qualify_id(PARAM_ID), qualify_id(S1S2_ID)),
    CONNECTION
)
PS3S1_CONN_ID = "11"
PS3S1_CONN = FirebaseConnection(
    PS3S1_CONN_ID,
    FirebasePointer(qualify_id(PARAM_ID), S3S1_ID),
    CONNECTION,
)
SVS2S3_CONN_ID = "12"
SVS2S3_CONN = FirebaseConnection(
    SVS2S3_CONN_ID,
    FirebasePointer(SUM_VAR_ID, S2S3_ID),
    CONNECTION,
)
S2SV_CONN_ID = qualify_id("13")
S2SV_CONN = FirebaseConnection(
    S2SV_CONN_ID,
    FirebasePointer(qualify_id(S2_ID), qualify_id(SUM_VAR_ID)),
    CONNECTION,
)
S3SV_CONN_ID = "14"
S3SV_CONN = FirebaseConnection(
    S3SV_CONN_ID,
    FirebasePointer(S3_ID, SUM_VAR_ID),
    CONNECTION,
)
S1S1S2_CONN_ID = qualify_id("15")
S1S1S2_CONN = FirebaseConnection(
    S1S1S2_CONN_ID,
    FirebasePointer(qualify_id(S1_ID), qualify_id(S1S2_ID)),
    CONNECTION,
)
S2S1S2_CONN_ID = qualify_id("16")
S2S1S2_CONN = FirebaseConnection(
    S2S1S2_CONN_ID,
    FirebasePointer(qualify_id(S2_ID), qualify_id(S1S2_ID)),
    CONNECTION,
)
S2S2S3_CONN_ID = "17"
S2S2S3_CONN = FirebaseConnection(
    S2S2S3_CONN_ID,
    FirebasePointer(S2_ID, S2S3_ID),
    CONNECTION,
)
S3S2S3_CONN_ID = "18"
S3S2S3_CONN = FirebaseConnection(
    S3S2S3_CONN_ID,
    FirebasePointer(S3_ID, S2S3_ID),
    CONNECTION,
)
S3S3S1_CONN_ID = "19"
S3S3S1_CONN = FirebaseConnection(
    S3S3S1_CONN_ID,
    FirebasePointer(S3_ID, S3S1_ID),
    CONNECTION,
)
OUTER_CONNECTIONS = [
    SVS2S3_CONN, S3SV_CONN, S2S2S3_CONN, S3S2S3_CONN, S3S3S1_CONN, PS3S1_CONN
]
INNER_CONNECTIONS = [
     S2SV_CONN, S1S1S2_CONN, S2S1S2_CONN, PS1S2_CONN
]

# Composition in Firebase:
# S1 and S2 exist both inside and out and are composed
# S1 substitution goes out -> in and S2 goes in -> out
# Sumvar exists both inside and out and is composed out -> in
# Param exists inside and is not composed.
S1_SUB = FirebaseSubstitution(
    S1_ID,
    qualify_id(S1_ID)
)
S2_SUB = FirebaseSubstitution(
    qualify_id(S2_ID),
    S2_ID
)
SUMVAR_SUB = FirebaseSubstitution(
    SUM_VAR_ID,
    qualify_id(SUM_VAR_ID)
)

# Static model
STATIC_MODEL_ID = "9"
STATIC_MODEL_NAME = "smName"
ST_MODEL = FirebaseStaticModel(
    STATIC_MODEL_ID,
    STATIC_MODEL_NAME,
    "Purple", # Arbitrary
    FirebasePoint(100, 30.1),
    STATIC_MODEL,
)

############################### Julia Components ###############################

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
    [],
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
