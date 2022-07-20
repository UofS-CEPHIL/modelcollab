import { ReactElement } from "react";
import { Group } from "react-konva";

import { FirebaseComponentModel as schema } from "database/build/export";

import Flow from "../ScreenObjects/Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR } from "../ScreenObjects/Stock";
import BaseCanvas from "./BaseCanvas";


export default class MoveModeCanvas extends BaseCanvas {
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
                                draggable={true}
                                key={i}
                                updateState={this.props.editComponent}
                            />
                        )
                    })
                }
            </Group>
        );
    }
}
