import { ReactElement } from "react";
import { Group } from "react-konva";

import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import Flow from "../ScreenObjects/Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR } from "../ScreenObjects/Stock";
import BaseCanvas from "./BaseCanvas";
import { FirebaseDataComponent } from "database/build/FirebaseComponentModel";


export default class StockModeCanvas extends BaseCanvas {

    protected onCanvasClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.children);
        const newStock = new schema.StockFirebaseComponent(
            componentID,
            { x, y, initvalue: "", text: "" }
        );
        this.props.addComponent(newStock);
    }

    protected renderChildren(): ReactElement {
        return (
            <Group>
                {
                    this.getFlows().map((flow, i) => {
                        return (
                            <Flow
                                flow={flow}
                                from={this.getComponent(flow.getData().from) as schema.StockFirebaseComponent}
                                to={this.getComponent(flow.getData().to) as schema.StockFirebaseComponent}
                                key={i}
                            />
                        )
                    })
                }
                {
                    this.getStocks().map((stock, i) => {
                        return (
                            <Stock
                                stock={stock}
                                color={DEFAULT_COLOR}
                                text={stock.getData().text}
                                key={i}
                                draggable={false}
                                updateState={this.props.editComponent}
                            />
                        )
                    })
                }
            </Group>
        );
    }
}
