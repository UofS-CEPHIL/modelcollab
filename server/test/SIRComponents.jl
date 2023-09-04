# Testing a simple SIR model with no composition
# * => S => I => R => back to S
# i.e. "cloud" flows to S representing births,
# R flows to S representing waning immunity.
#
# totalPop and notInfected sumvars
# I/totalPop dynvar but doesn't actually do anything
# Various params

# params
DAYS_W_IMM_ID = "0"
DAYS_W_IMM_NAME = "daysWithImmunity"
DAYS_W_IMM_VALUE = "90.0"
DAYS_INFECTED_ID = "2"
DAYS_INFECTED_NAME = "daysInfected"
DAYS_INFECTED_VALUE = "11" # leave this as an integer
INITIAL_POP_ID = "3"
INITIAL_POP_NAME = "initialPop"
INITIAL_POP_VALUE = "1000000.0"
START_TIME_ID = "444"
START_TIME_NAME = "startTime"
START_TIME_VALUE = "0.0"
STOP_TIME_ID = "555"
STOP_TIME_NAME = "stopTime"
STOP_TIME_VALUE = "1000.0"

# sumvar
TOTAL_POP_ID = "4"
TOTAL_POP_NAME = "totalPop"
NON_INFECTED_ID = "5"
NON_INFECTED_NAME = "notInfected"

# stocks
S_STOCK_ID = "6"
S_STOCK_NAME = "S"
S_INIT_VALUE = "initialPop - 1.0"
I_STOCK_ID = "7"
I_STOCK_NAME = "I"
I_INIT_VALUE = "1" # leave this as an integer
R_STOCK_ID = "8"
R_STOCK_NAME = "R"
R_INIT_VALUE = "0.0"

# var
INFECTION_RATE_VAR_ID = "9"
INFECTION_RATE_VAR_NAME = "infectionRate"
INFECTION_RATE_VAR_EQUATION = "$(I_STOCK_NAME)/$(TOTAL_POP_NAME)"

# flows
BIRTH_ID = "10"
BIRTH_NAME = "birth"
BIRTH_EQUATION = "100"
INF_ID = "11"
INF_NAME = "newInfection"
INF_EQUATION = "$(S_STOCK_NAME) * $(I_STOCK_NAME) / $(TOTAL_POP_NAME)"
REC_ID = "12"
REC_NAME = "newRecovery"
REC_EQUATION = "$(I_STOCK_NAME)/$(DAYS_INFECTED_NAME)"
WANIMM_ID = "13"
WANIMM_NAME = "waningImmunity"
WANIMM_EQUATION = "$(R_STOCK_NAME)/$(DAYS_W_IMM_NAME)"

# components
S_STOCK::Stock = Stock(
    S_STOCK_NAME,
    S_STOCK_ID,
    S_INIT_VALUE,
    [BIRTH_NAME, WANIMM_NAME],
    [INF_NAME],
    [INITIAL_POP_NAME],
    [TOTAL_POP_NAME, NON_INFECTED_NAME],
    [],
    [INF_NAME]
)
I_STOCK::Stock = Stock(
    I_STOCK_NAME,
    I_STOCK_ID,
    I_INIT_VALUE,
    [INF_NAME],
    [REC_NAME],
    [DAYS_INFECTED_NAME],
    [TOTAL_POP_NAME],
    [INFECTION_RATE_VAR_NAME],
    [INF_NAME, REC_NAME]
)
R_STOCK::Stock = Stock(
    R_STOCK_NAME,
    R_STOCK_ID,
    R_INIT_VALUE,
    [REC_NAME],
    [WANIMM_NAME],
    [DAYS_W_IMM_NAME],
    [NON_INFECTED_NAME, TOTAL_POP_NAME],
    [],
    [WANIMM_NAME]
)
DAYS_W_IMM_PARAM::Parameter = Parameter(
    DAYS_W_IMM_NAME,
    DAYS_W_IMM_ID,
    DAYS_W_IMM_VALUE
)
DAYS_INFECTED_PARAM::Parameter = Parameter(
    DAYS_INFECTED_NAME,
    DAYS_INFECTED_ID,
    DAYS_INFECTED_VALUE
)
INITIAL_POP_PARAM::Parameter = Parameter(
    INITIAL_POP_NAME,
    INITIAL_POP_ID,
    INITIAL_POP_VALUE
)
START_TIME_PARAM::Parameter = Parameter(
    START_TIME_NAME,
    START_TIME_ID,
    START_TIME_VALUE
)
STOP_TIME_PARAM::Parameter = Parameter(
    STOP_TIME_NAME,
    STOP_TIME_ID,
    STOP_TIME_VALUE
)
TOTAL_POP_SUMVAR::SumVariable = SumVariable(
    TOTAL_POP_NAME,
    TOTAL_POP_ID,
    [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME]
)
NON_INFECTED_SUMVAR::SumVariable = SumVariable(
    NON_INFECTED_NAME,
    NON_INFECTED_ID,
    [S_STOCK_NAME, R_STOCK_NAME]
)
BIRTH_FLOW::Flow = Flow(
    BIRTH_NAME,
    BIRTH_ID,
    nothing,
    S_STOCK_NAME,
    BIRTH_EQUATION,
    [],
    []
)
INF_FLOW::Flow = Flow(
    INF_NAME,
    INF_ID,
    S_STOCK_NAME,
    I_STOCK_NAME,
    INF_EQUATION,
    [S_STOCK_NAME, I_STOCK_NAME],
    [TOTAL_POP_NAME]
)
REC_FLOW::Flow = Flow(
    REC_NAME,
    REC_ID,
    I_STOCK_NAME,
    R_STOCK_NAME,
    REC_EQUATION,
    [I_STOCK_NAME],
    []
)
WANIMM_FLOW::Flow = Flow(
    WANIMM_NAME,
    WANIMM_ID,
    R_STOCK_NAME,
    S_STOCK_NAME,
    WANIMM_EQUATION,
    [R_STOCK_NAME],
    []
)
INFECTION_RATE_VAR::DynamicVariable = DynamicVariable(
    INFECTION_RATE_VAR_NAME,
    INFECTION_RATE_VAR_ID,
    INFECTION_RATE_VAR_EQUATION,
    [I_STOCK_NAME],
    [TOTAL_POP_NAME]
)

MODEL_ID = "99999"
MODEL = StockFlowModel(
    MODEL_ID,
    [S_STOCK, I_STOCK, R_STOCK],
    [BIRTH_FLOW, INF_FLOW, REC_FLOW, WANIMM_FLOW],
    [
        DAYS_W_IMM_PARAM, DAYS_INFECTED_PARAM, INITIAL_POP_PARAM,
        START_TIME_PARAM, STOP_TIME_PARAM
    ],
    [INFECTION_RATE_VAR],
    [TOTAL_POP_SUMVAR, NON_INFECTED_SUMVAR]
)

# The feet that we expect FootBuilder to build for this model
S_FOOT = Foot(S_STOCK_NAME, [TOTAL_POP_NAME, NON_INFECTED_NAME], [MODEL_ID])
I_FOOT = Foot(I_STOCK_NAME, [TOTAL_POP_NAME], [MODEL_ID])
R_FOOT = Foot(R_STOCK_NAME, [TOTAL_POP_NAME, NON_INFECTED_NAME], [MODEL_ID])
