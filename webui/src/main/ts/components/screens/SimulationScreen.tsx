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
    selectedComponentId: string | null;
}

let lastMode: UiMode = UiMode.MOVE;


export default class SimulationScreen extends React.Component<Props, State> {

    private readonly dm: FirebaseDataModel;

    constructor(props: Props) {
        super(props);
        this.state = {
            mode: UiMode.MOVE,
            components: [],
            selectedComponentId: null
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

                let selectedComponentId: string | null = this.state.selectedComponentId;
                if (!dbComponents.find(c => c.getId() === selectedComponentId)) {
                    selectedComponentId = null;
                }
                this.setState({
                    ...this.state,
                    selectedComponentId,
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
                setTimeout(() => { this.setSelected(null) });
            lastMode = mode;
        }
        const selectedComponent = this.state.selectedComponentId
            ? this.state.components.find(c => c.getId() === this.state.selectedComponentId)
            : undefined;
        return (
            <React.Fragment>
                {

                    this.props.createToolbar({
                        mode: this.state.mode,
                        setMode: setMode,
                        returnToSessionSelect: this.props.returnToSessionSelect,
                        sessionId: this.props.sessionId,
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
                            selectedComponentId: this.state.selectedComponentId,
                            showConnectionHandles: false,
                            editComponent: c => this.updateComponent(c),
                            deleteComponent: id => this.removeComponent(id),
                            addComponent: c => this.addComponent(c),
                            setSelected: id => this.setSelected(id)
                        }
                    )
                }
                {
                    (selectedComponent && this.shouldShowEditBox()) &&
                    this.props.createEditBox({
                        initialComponent: selectedComponent.getDatabaseObject(),
                        handleCancel: () => this.setSelected(null),
                        handleSave: (comp: schema.FirebaseDataComponent<any>) => {
                            const components: ComponentUiData[] = this.state.components
                                .filter(c => c.getId() !== comp.getId())
                                .concat(this.createUiComponent(comp));
                            this.dm.updateComponent(this.props.sessionId, comp);
                            this.setState({ ...this.state, components, selectedComponentId: null });
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
            setTimeout(() => { this.setSelected(null) }); // ????? this is required, otherwise it ignores selection change
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
            // Lord, what a lot of orphans
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
            this.dm.removeComponent(this.props.sessionId, id);
            orphans.forEach(o => this.dm.removeComponent(this.props.sessionId, o.getId()));
        }
    }

    private updateComponent(newComponent: ComponentUiData): void {
        const components: ComponentUiData[] = this.state.components
            .filter(c => c.getId() !== newComponent.getId()).concat([newComponent]);
        this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
        this.setState({ ...this.state, components });
    }

    private setSelected(selectedComponentId: string | null): void {
        if (selectedComponentId !== this.state.selectedComponentId)
            this.setState({ ...this.state, selectedComponentId });
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
}
