# This file tests the case of the simplest valid model:
# one stock, start time, and stop time.

S1_NAME = "s1"
S1_ID = "1"
S1_VAL = "1000"
S1_EXPECTED_VAL = "1000.0"
START_TIME_NAME = "startTime"
START_TIME_ID = "5"
START_TIME_VAL = "0"
START_TIME_EXPECTED_VAL = "0.0"
STOP_TIME_NAME = "stopTime"
STOP_TIME_ID = "6"
STOP_TIME_VAL = "100"
STOP_TIME_EXPECTED_VAL = "100.0"
MODEL_ID = "7"
PATH = "/my/path"

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
START_TIME::Parameter = Parameter(
    START_TIME_NAME,
    START_TIME_ID,
    START_TIME_VAL
)
STOP_TIME::Parameter = Parameter(
    STOP_TIME_NAME,
    STOP_TIME_ID,
    STOP_TIME_VAL
)
MODEL::StockFlowModel = StockFlowModel(
    MODEL_ID,
    [S1],
    [],
    [START_TIME, STOP_TIME],
    [],
    []
)
FOOT::Foot = Foot(S1_NAME, [], [MODEL_ID])
