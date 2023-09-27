import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { DefaultBehaviours } from "./DefaultBehaviours";

export interface Point { x: number, y: number };

export default class FlowModeBehaviour extends DefaultBehaviours {

    private firstClick: Cell | Point | null = null;

    public canvasClicked(x: number, y: number): void {
        if (this.firstClick) {
            this.addComponents(this.firstClick, { x, y });
        }
        else {
            this.firstClick = { x, y };
        }
    }

    public selectionChanged(selection: Cell[]): void {
        if (selection.length == 1) {
            if (this.firstClick) {
                this.addComponents(this.firstClick, selection[0]);
            }
            else {
                this.firstClick = selection[0];
            }
        }
        // If the user selects a group, forget the last single cell that was
        // selected
        else if (selection.length > 1) {
            this.firstClick = null;
        }
    }

    private addComponents(source: Cell | Point, target: Cell | Point) {
        this.firstClick = null;
        this.getGraph().batchUpdate(() => {
            if (!(source instanceof Cell)) {
                source = this.getGraph().insertVertex(
                    FlowModeBehaviour.makeCloudArgs(
                        this.getGraph().getDefaultParent(),
                        source.x,
                        source.y
                    )
                );
            }
            if (!(target instanceof Cell)) {
                target = this.getGraph().insertVertex(
                    FlowModeBehaviour.makeCloudArgs(
                        this.getGraph().getDefaultParent(),
                        target.x,
                        target.y
                    )
                );
            }

            const flow = new schema.FlowFirebaseComponent(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                { text: "", equation: "", from: "", to: "" }
            );

            this.getGraph().insertEdge(
                FlowModeBehaviour.makeFlowArgs(
                    this.getGraph().getDefaultParent(),
                    source,
                    target,
                    flow
                )
            );
        });
    }

    private static makeCloudArgs(
        parent: Cell,
        x: number,
        y: number
    ): VertexParameters {
        return {
            parent,
            value: "",
            x,
            y,
            width: FlowModeBehaviour.CLOUD_DEFAULT_WIDTH_PX,
            height: FlowModeBehaviour.CLOUD_DEFAULT_HEIGHT_PX,
            style: {
                shape: "cloud",
                fillColor: FlowModeBehaviour.FILL_COLOUR,
                strokeColor: FlowModeBehaviour.STROKE_COLOUR
            }
        };
    }
}
