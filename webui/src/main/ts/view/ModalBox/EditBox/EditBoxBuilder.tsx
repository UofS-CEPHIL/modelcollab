import { ReactElement } from "react";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import FirebaseDynamicVariable from "../../../data/components/FirebaseDynamicVariable";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import FirebaseParameter from "../../../data/components/FirebaseParameter";
import FirebaseStock from "../../../data/components/FirebaseStock";
import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import VariableEditBox from "./DynamicVariableEditBox";
import FlowEditBox from "./FlowEditBox";
import ParameterEditBox from "./ParameterEditBox";
import StockEditBox from "./StockEditBox";
import SumVariableEditBox from "./SumVariableEditBox";

export default class EditBoxBuilder {

    public static build(
        component: FirebaseComponent,
        handleSave: (c: FirebaseComponent) => void,
        handleCancel: () => void
    ): ReactElement | null {
        switch (component.getType()) {
            case ComponentType.STOCK:
                const st = component as FirebaseStock;
                return (
                    <StockEditBox
                        initialComponent={st}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case ComponentType.FLOW:
                const fl = component as FirebaseFlow;
                return (
                    <FlowEditBox
                        initialComponent={fl}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case ComponentType.PARAMETER:
                const pa = component as FirebaseParameter;
                return (
                    <ParameterEditBox
                        initialComponent={pa}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case ComponentType.SUM_VARIABLE:
                const sv = component as FirebaseSumVariable;
                return (
                    <SumVariableEditBox
                        initialComponent={sv}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                );
            case ComponentType.VARIABLE:
                const dv = component as FirebaseDynamicVariable;
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
