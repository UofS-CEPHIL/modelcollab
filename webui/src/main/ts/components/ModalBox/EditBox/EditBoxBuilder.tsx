import { FirebaseComponentModel as schema } from "database/build/export";
import { ReactElement } from "react";
import VariableEditBox from "./DynamicVariableEditBox";
import FlowEditBox from "./FlowEditBox";
import ParameterEditBox from "./ParameterEditBox";
import StockEditBox from "./StockEditBox";
import SumVariableEditBox from "./SumVariableEditBox";

export default class EditBoxBuilder {

    public static build(
        component: schema.FirebaseDataComponent<any>,
        handleSave: (c: schema.FirebaseDataComponent<any>) => void,
        handleCancel: () => void
    ): ReactElement | null {
        switch (component.getType()) {
            case schema.ComponentType.STOCK:
                const st = component as schema.StockFirebaseComponent;
                return (
                    <StockEditBox
                        initialComponent={st}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case schema.ComponentType.FLOW:
                const fl = component as schema.FlowFirebaseComponent;
                return (
                    <FlowEditBox
                        initialComponent={fl}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case schema.ComponentType.PARAMETER:
                const pa = component as schema.ParameterFirebaseComponent;
                return (
                    <ParameterEditBox
                        initialComponent={pa}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case schema.ComponentType.SUM_VARIABLE:
                const sv = component as schema.SumVariableFirebaseComponent;
                return (
                    <SumVariableEditBox
                        initialComponent={sv}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case schema.ComponentType.VARIABLE:
                const dv = component as schema.VariableFirebaseComponent;
                return (
                    <VariableEditBox
                        initialComponent={dv}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            default:
                console.error(
                    "Attempting to open modal box on invalid component: "
                    + component.getType()
                );
                return null;
        }
    }
}
