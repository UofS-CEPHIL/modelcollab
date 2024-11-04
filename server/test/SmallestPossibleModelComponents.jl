# This file tests the case of the simplest valid model:
# one stock, start time, and stop time.


#################################### Values ####################################

S1_NAME = "s1"
S1_ID = "1"
S1_VAL = "1000"
S1_EXPECTED_VAL = "1000.0"
PARAM_NAME = "startTime"
PARAM_ID = "5"
PARAM_VAL = "0"
START_TIME_EXPECTED_VAL = "0.0"
MODEL_ID = "7"
PATH = "/my/path"

############################# Firebase Components ##############################

FB_S1::FirebaseStock = FirebaseStock(
    S1_ID,
    FirebasePoint(100.3, 201.1), # arbitrary
    FirebaseText(S1_NAME),
    FirebaseValue(S1_VAL),
    STOCK
)

FB_PARAM::FirebaseParameter = FirebaseParameter(
    PARAM_ID,
    FirebasePoint(0, 0),
    FirebaseText(PARAM_NAME),
    FirebaseValue(PARAM_VAL),
    PARAMETER
)

############################### Julia Components ###############################

S1::Stock = Stock(
    S1_NAME,
    S1_ID,
    S1_VAL,
    [],
    [],
    [],
    [],
    [],
    []
)
MODEL::StockFlowModel = StockFlowModel(
    MODEL_ID,
    [S1],
    [],
    [],
    [],
    []
)
FOOT::Foot = Foot(S1_NAME, [], [MODEL_ID])
