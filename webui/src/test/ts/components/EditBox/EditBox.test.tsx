import { FirebaseComponentModel as schema } from "database/build/export";
import EditBoxTest from "./EditBoxTest";

const AN_ID = "1";

const stockTest = new EditBoxTest<schema.StockFirebaseComponent>(
    new schema.StockFirebaseComponent(AN_ID, { x: 0, y: 0, text: "stock", initvalue: "stockvalue" }),
    ["text", "initvalue"]
);
const flowTest = new EditBoxTest<schema.FlowFirebaseComponent>(
    new schema.FlowFirebaseComponent(AN_ID, { from: "11", to: "22", text: "flow", equation: "1 + 1" }),
    ["text", "equation"]
);
const paramTest = new EditBoxTest<schema.ParameterFirebaseComponent>(
    new schema.ParameterFirebaseComponent(AN_ID, { x: 0, y: 0, text: "parameter", value: "123" }),
    ["text", "value"]
);
const varTest = new EditBoxTest<schema.VariableFirebaseComponent>(
    new schema.VariableFirebaseComponent(AN_ID, { x: 0, y: 0, text: "variable", value: "x + 1" }),
    ["text", "value"],
    "Dynamic Variable"
);
const sumVarTest = new EditBoxTest<schema.SumVariableFirebaseComponent>(
    new schema.SumVariableFirebaseComponent(AN_ID, { x: 0, y: 0, text: "sumvariable" }),
    ["text"],
    "Sum Variable"
);

[
    stockTest,
    flowTest,
    paramTest,
    varTest,
    sumVarTest
].forEach(t => t.describeTest());
