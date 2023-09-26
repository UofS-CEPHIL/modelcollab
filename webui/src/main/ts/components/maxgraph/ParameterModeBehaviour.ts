import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import { DefaultBehaviours } from "./DefaultBehaviours";

export class ParameterModeBehaviour extends DefaultBehaviours {

    public static readonly NAME = "Parameter"
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newParam = new schema.ParameterFirebaseComponent(
            newId,
            { x, y, value: "", text: "" }
        );
        this.getGraph().batchUpdate(() => {
            this.getGraph().insertVertex(
                ParameterModeBehaviour.makeParamArgs(
                    this.getGraph().getDefaultParent(),
                    newParam
                )
            );
        });
    }

    private static makeParamArgs(
        parent: Cell,
        param: schema.ParameterFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            id: param.getId(),
            value: param.getData().text,
            position: [param.getData().x, param.getData().y],
            width: ParameterModeBehaviour.DEFAULT_WIDTH_PX,
            height: ParameterModeBehaviour.DEFAULT_HEIGHT_PX,
            style: {
                shape: "text",
                fillColor: ParameterModeBehaviour.FILL_COLOUR,
                strokeColor: ParameterModeBehaviour.STROKE_COLOUR,
                fontColor: ParameterModeBehaviour.STROKE_COLOUR,
                fontSize: ParameterModeBehaviour.DEFAULT_FONT_SIZE,
                fontStyle: 2
            }
        };
    }
}
