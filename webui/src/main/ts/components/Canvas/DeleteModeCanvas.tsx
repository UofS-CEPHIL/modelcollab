import { ReactElement } from "react";
import { Group } from "react-konva";
import Flow from "../ScreenObjects/Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR } from "../ScreenObjects/Stock";
import BaseCanvas from "./BaseCanvas";

import { FirebaseComponentModel as schema } from "database/build/export";


export default class DeleteModeCanvas extends BaseCanvas {

    protected onComponentClicked(c: schema.FirebaseDataComponent): void {
        this.props.deleteComponent(c.getId());
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
                                draggable={false}
                                text={stock.getData().text}
                                updateState={this.props.editComponent}
                                key={i}
                            />
                        )
                    })
                }
            </Group>
        );
    }
}
