import ComponentType from "./ComponentType";
import FirebaseCausalLoopLink from "./FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "./FirebaseCausalLoopVertex";
import FirebaseComponent from "./FirebaseComponent";
import FirebaseConnection from "./FirebaseConnection";
import FirebaseDynamicVariable from "./FirebaseDynamicVariable";
import FirebaseFlow from "./FirebaseFlow";
import FirebaseParameter from "./FirebaseParameter";
import FirebaseStaticModel from "./FirebaseStaticModel";
import FirebaseStock from "./FirebaseStock";
import FirebaseSumVariable from "./FirebaseSumVariable";

export function createFirebaseDataComponent(
    id: string,
    data: any,
    idPrefix?: string
): FirebaseComponent {
    const componentType: string = data.type;
    const dataVal: any = data.data;
    if (idPrefix) {
        id = idPrefix + id;
        if (dataVal.from) dataVal.from = idPrefix + dataVal.from;
        if (dataVal.to) dataVal.to = idPrefix + dataVal.to;
    }

    let component: FirebaseComponent;

    switch (componentType) {
        case ComponentType.STOCK.toString():
            component = new FirebaseStock(
                id,
                FirebaseStock.toStockComponentData(dataVal)
            );
            break;

        case ComponentType.FLOW.toString():
            component = new FirebaseFlow(
                id,
                FirebaseFlow.toFlowComponentData(dataVal)
            );
            break;

        case ComponentType.PARAMETER.toString():
            component = new FirebaseParameter(
                id,
                FirebaseParameter.toParameterComponentData(dataVal)
            );
            break;
        case ComponentType.VARIABLE.toString():
            component = new FirebaseDynamicVariable(
                id,
                FirebaseDynamicVariable.toDynamicVariableComponentData(dataVal)
            );
            break;
        case ComponentType.SUM_VARIABLE.toString():
            component = new FirebaseSumVariable(
                id,
                FirebaseSumVariable.toSumVariableComponentData(dataVal)
            );
            break;
        case ComponentType.CONNECTION.toString():
            component = new FirebaseConnection(
                id,
                FirebaseConnection.toConnectionComponentData(dataVal)
            );
            break;
        case ComponentType.STATIC_MODEL.toString():
            component = new FirebaseStaticModel(
                id,
                FirebaseStaticModel.toStaticModelComponentData(dataVal)
            );
            break;
        case ComponentType.CLD_VERTEX.toString():
            component = new FirebaseCausalLoopVertex(
                id,
                FirebaseCausalLoopVertex.toVertexComponentData(dataVal)
            );
            break;
        case ComponentType.CLD_LINK.toString():
            component = new FirebaseCausalLoopLink(
                id,
                FirebaseCausalLoopLink.toCausalLoopLinkData(dataVal)
            );
            break;
        default:
            throw new Error("Unknown component type: " + componentType);
    }

    return component;
}
