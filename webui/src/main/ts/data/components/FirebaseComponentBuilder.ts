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

    // TODO switch these to "toXComponentData" for all
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
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string,
                    equation: dataVal.equation as string,
                    text: dataVal.text as string,
                }
            );
            break;

        case ComponentType.PARAMETER.toString():
            component = new FirebaseParameter(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    value: dataVal.value as string
                }
            );
            break;
        case ComponentType.VARIABLE.toString():
            component = new FirebaseDynamicVariable(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    value: dataVal.value as string
                }
            );
            break;
        case ComponentType.SUM_VARIABLE.toString():
            component = new FirebaseSumVariable(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string
                }
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
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    modelId: dataVal.modelId as string,
                    color: dataVal.color as string
                }
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
