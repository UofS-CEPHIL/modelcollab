import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
import FirebaseConnection from "./FirebaseConnection";
import FirebaseDynamicVariable from "./FirebaseDynamicVariable";
import FirebaseFlow from "./FirebaseFlow";
import FirebaseParameter from "./FirebaseParameter";
import FirebaseScenario, { ParameterOverrides } from "./FirebaseScenario";
import FirebaseStaticModel from "./FirebaseStaticModel";
import FirebaseStock from "./FirebaseStock";
import { FirebaseSubstitution } from "./FirebaseSubstitution";
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
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    initvalue: dataVal.initvalue as string
                }
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
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string,
                    handleXOffset: dataVal.handleXOffset as number,
                    handleYOffset: dataVal.handleYOffset as number
                }
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
        case ComponentType.SUBSTITUTION.toString():
            component = new FirebaseSubstitution(
                id,
                {
                    replacedId: dataVal.replacedId as string,
                    replacementId: dataVal.replacementId as string
                }
            );
            break;
        case ComponentType.SCENARIO.toString():
            component = new FirebaseScenario(
                id,
                {
                    name: dataVal.name as string,
                    paramOverrides: dataVal.paramOverrides
                        ? dataVal.paramOverrides as ParameterOverrides
                        : {}
                }
            );
            break;
        default:
            throw new Error("Unknown component type: " + componentType);
    }

    return component;
}
