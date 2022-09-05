import React, { ReactElement } from 'react';

import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData from '../ScreenObjects/ComponentUiData';
import { Props as CanvasProps } from "../Canvas/BaseCanvas";
import Toolbar, { Props as ToolbarProps } from '../Toolbar/Toolbar';
import { UiMode } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { DataSnapshot } from 'firebase/database';
import EditBox, { Props as EditBoxProps } from '../EditBox/EditBox';
import StockUiData from '../ScreenObjects/StockUiData';
import FlowUiData from '../ScreenObjects/FlowUiData';
import ConnectionUiData from '../ScreenObjects/ConnectionUiData';
import ParameterUiData from '../ScreenObjects/ParameterUiData';
import SumVariableUiData from '../ScreenObjects/SumVariableUiData';
import DynamicVariableUiData from '../ScreenObjects/DynamicVariableUiData';
import CloudUiData from '../ScreenObjects/CloudUiData';
import RestClientImpl from '../../rest/RestClientImpl';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    returnToSessionSelect: () => void;
    createCanvasForMode: (mode: UiMode, props: CanvasProps) => ReactElement;
    createToolbar: (props: ToolbarProps) => ReactElement;
    createEditBox: (props: EditBoxProps) => ReactElement;
}

interface State {
    mode: UiMode,
    components: ComponentUiData[];
    selectedComponentIds: string[];
}

let lastMode: UiMode = UiMode.MOVE;


export default class SimulationScreen extends React.Component<Props, State> {

    private readonly dm: FirebaseDataModel;

    constructor(props: Props) {
        super(props);
        this.state = {
            mode: UiMode.MOVE,
            components: [],
            selectedComponentIds: []
        };
        this.dm = props.firebaseDataModel;
        document.title = applicationConfig.appName;
    }

    componentDidMount() {
        this.dm.subscribeToSession(
            this.props.sessionId,
            (dbComponents: schema.FirebaseDataComponent<any>[]) => {

                // Load objects s.t. stocks are loaded before flows,
                // and all pointable components are loaded before
                // pointers that reference them.
                const nonPointerComponents: ComponentUiData[] = dbComponents
                    .filter(c => !this.isPointerComponentType(c.getType()))
                    .map(c => this.createUiComponent(c));

                const flowComponents: ComponentUiData[] = dbComponents
                    .filter(c => c.getType() === schema.ComponentType.FLOW)
                    .map(c => this.createUiComponent(c));

                const nonFlowPointerComponents: ComponentUiData[] = dbComponents
                    .filter(c =>
                        this.isPointerComponentType(c.getType())
                        && c.getType() !== schema.ComponentType.FLOW
                    ).map(c => this.createUiComponent(c));

                const components: ComponentUiData[] = nonPointerComponents
                    .concat(flowComponents)
                    .concat(nonFlowPointerComponents);

                this.setState({
                    ...this.state,
                    selectedComponentIds: this.state.selectedComponentIds
                        .filter(id => dbComponents.find(c => c.getId() === id)),
                    components
                });
            }
        );
    }

    private isPointerComponentType(componentType: string) {
        switch (componentType) {
            case schema.ComponentType.STOCK.toString(): return false;
            case schema.ComponentType.PARAMETER.toString(): return false;
            case schema.ComponentType.VARIABLE.toString(): return false;
            case schema.ComponentType.SUM_VARIABLE.toString(): return false;
            case schema.ComponentType.CLOUD.toString(): return false;
            case schema.ComponentType.FLOW.toString(): return true;
            case schema.ComponentType.CONNECTION.toString(): return true;
            default: throw new Error("Unknown component: " + componentType);
        }
    }

    render() {
        const setMode = (mode: UiMode) => {
            this.setState({ ...this.state, mode });
            if (lastMode !== mode)
                setTimeout(() => { this.setSelected([]) });
            lastMode = mode;
        }
        const selectedComponents = this.state.selectedComponentIds.map(
            id => this.state.components.find(c => c.getId() === id)
        );
        return (
            <React.Fragment>
                {

                    this.props.createToolbar({
                        mode: this.state.mode,
                        setMode: setMode,
                        returnToSessionSelect: this.props.returnToSessionSelect,
                        sessionId: this.props.sessionId,
                        downloadData: b => this.downloadData(b),
                        restClient: new RestClientImpl()
                    })
                }
                {
                    this.props.createCanvasForMode(
                        this.state.mode,
                        {
                            firebaseDataModel: this.dm,
                            sessionId: this.props.sessionId,
                            children: this.state.components,
                            selectedComponentIds: this.state.selectedComponentIds,
                            showConnectionHandles: false,
                            editComponent: c => this.updateComponent(c),
                            deleteComponent: id => this.removeComponent(id),
                            addComponent: c => this.addComponent(c),
                            setSelected: ids => this.setSelected(ids)
                        }
                    )
                }
                {
                    (selectedComponents.length === 1 && this.shouldShowEditBox()) &&
                    this.props.createEditBox({
                        initialComponent: selectedComponents[0]?.getDatabaseObject(),
                        handleCancel: () => this.setSelected([]),
                        handleSave: (comp: schema.FirebaseDataComponent<any>) => {
                            const components: ComponentUiData[] = this.state.components
                                .filter(c => c.getId() !== comp.getId())
                                .concat(this.createUiComponent(comp));
                            this.dm.updateComponent(this.props.sessionId, comp);
                            this.setState({ ...this.state, components, selectedComponentIds: [] });
                        }
                    })
                }
            </React.Fragment >
        );
    }


    private shouldShowEditBox(): boolean {
        return this.state.mode === UiMode.EDIT;
    }

    private addComponent(newComponent: ComponentUiData): void {
        if (!this.state.components.find(c => c.getId() === newComponent.getId())) {
            this.setState(
                {
                    ...this.state,
                    components: this.state.components.concat([newComponent])
                }
            );
            setTimeout(() => { this.setSelected([]) }); // ????? this is required, otherwise it ignores selection change
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
        }
    }

    private removeComponent(id: string): void {
        const findOrphans = (component: ComponentUiData) => {
            return this.state.components
                .filter(c => this.isPointerComponentType(c.getType()))
                .filter(c => c.getData().from === component.getId() || c.getData().to === component.getId());
        }
        const findOrphansRecursively = (component: ComponentUiData) => {
            // What a lot of orphans
            let orphans: ComponentUiData[] = [];
            let newOrphans: ComponentUiData[] = [component];
            while (newOrphans.length > 0) {
                let newNewOrphans: ComponentUiData[] = [];
                for (const orphan of newOrphans) {
                    const subOrphans = findOrphans(orphan);
                    const unique = subOrphans.filter(o => { return orphans.find(c => c.getId() === o.getId()) === undefined });
                    orphans = orphans.concat(unique);
                    newNewOrphans = newNewOrphans.concat(unique);
                }
                newOrphans = newNewOrphans;
            }
            return orphans;
        }

        const component = this.state.components.find(c => c.getId() === id);
        if (component) {
            const orphans = findOrphansRecursively(component);
            const components = this.state.components
                .filter(c => c.getId() !== id)
                .filter(c => { return orphans.find(o => o.getId() === c.getId()) === undefined });
            this.setState(
                {
                    ...this.state,
                    components
                }
            );
            this.dm.removeComponents(this.props.sessionId, [...orphans.map(o => o.getId()), component.getId()], this.state.components);
        }
    }

    private updateComponent(newComponent: ComponentUiData): void {
        const oldComponent = this.state.components.find(c => c.getId() === newComponent.getId());
        if (!oldComponent) throw new Error();
        let newComponentsList: ComponentUiData[];
        const xDiff = (newComponent.getData().x || 0) - (oldComponent.getData().x || 0);
        const yDiff = (newComponent.getData().y || 0) - (oldComponent.getData().y || 0);
        if ((xDiff === 0 && yDiff === 0) || this.state.selectedComponentIds.length < 2) {
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
            newComponentsList = this.state.components
                .filter(c => c.getId() !== newComponent.getId()).concat([newComponent])
        }
        else {
            newComponentsList = this.state.components.map(c => {
                if (c.getId() === newComponent.getId()) {
                    return newComponent;
                }
                else if (this.state.selectedComponentIds.includes(c.getId())) {
                    const oldX = c.getData().x as number;
                    const oldY = c.getData().y as number;
                    if (!oldX || !oldY) {
                        return c;
                    }
                    else {
                        return c.withData({ ...c.getData(), x: oldX + xDiff, y: oldY + yDiff });
                    }
                }
                else {
                    return c;
                }
            });
        }

        newComponentsList.forEach(c => this.dm.updateComponent(this.props.sessionId, c.getDatabaseObject()));
        this.setState({ ...this.state, components: newComponentsList });
    }

    private setSelected(selectedComponentIds: string[]): void {
        this.setState({ ...this.state, selectedComponentIds });
    }

    private createUiComponent(dbComponent: schema.FirebaseDataComponent<any>): ComponentUiData {
        switch (dbComponent.getType()) {
            case schema.ComponentType.STOCK:
                return new StockUiData(dbComponent);
            case schema.ComponentType.FLOW:
                return new FlowUiData(dbComponent);
            case schema.ComponentType.CONNECTION:
                return new ConnectionUiData(dbComponent);
            case schema.ComponentType.PARAMETER:
                return new ParameterUiData(dbComponent);
            case schema.ComponentType.SUM_VARIABLE:
                return new SumVariableUiData(dbComponent);
            case schema.ComponentType.VARIABLE:
                return new DynamicVariableUiData(dbComponent);
            case schema.ComponentType.CLOUD:
                return new CloudUiData(dbComponent);
        }
    }

    private downloadData(blob: Blob): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "ModelResults.png";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
