import { ReactElement } from "react";
import { Group } from "react-konva";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import Flow from "../ScreenObjects/Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR, SELECTED_COLOR } from "../ScreenObjects/Stock";
import BaseCanvas from "./BaseCanvas";


export default class FlowModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: schema.FirebaseDataComponent): void {
        if (component.getType() === schema.ComponentType.STOCK) {
            if (!this.props.selectedComponentId) {
                this.props.setSelected(component.getId());
            }
            else if (component.getId() !== this.props.selectedComponentId) {
                const newFlow = new schema.FlowFirebaseComponent(
                    IdGenerator.generateUniqueId(this.props.children),
                    {
                        from: this.props.selectedComponentId,
                        to: component.getId(),
                        equation: "",
                        dependsOn: [],
                        text: ""
                    }
                );
                console.log(`new component ${newFlow}`)
                console.log(`dependsOn=${Object.entries(newFlow.getData().dependsOn)} `)
                this.props.addComponent(newFlow);
            }
        }
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
                                color={
                                    this.props.selectedComponentId === stock.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR
                                }
                                draggable={false}
                                text={stock.getData().text}
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
