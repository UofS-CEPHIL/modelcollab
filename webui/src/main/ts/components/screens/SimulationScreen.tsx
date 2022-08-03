import React from 'react';

import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData, { PointableComponent } from '../ScreenObjects/ComponentUiData';
import { ComponentNotFoundError, Props as CanvasProps } from "../Canvas/BaseCanvas";
import Toolbar from '../Toolbar/Toolbar';
import FirebaseDataModelImpl from '../../data/FirebaseDataModelImpl';
import { UiMode } from '../../UiMode';
import FirebaseManager from '../../data/FirebaseManager';
import applicationConfig from '../../config/applicationConfig';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import MoveModeCanvas from '../Canvas/MoveModeCanvas';
import StockModeCanvas from '../Canvas/StockModeCanvas';
import FlowModeCanvas from '../Canvas/FlowModeCanvas';
import DeleteModeCanvas from '../Canvas/DeleteModeCanvas';
import EditModeCanvas from '../Canvas/EditModeCanvas';
import { DataSnapshot } from 'firebase/database';
import EditBox from '../EditBox/EditBox';
import ParamModeCanvas from '../Canvas/ParamModeCanvas';
import StockUiData from '../ScreenObjects/StockUiData';
import FlowUiData from '../ScreenObjects/FlowUiData';
import ConnectionUiData from '../ScreenObjects/ConnectionUiData';
import ParameterUiData from '../ScreenObjects/ParameterUiData';
import ConnectModeCanvas from '../Canvas/ConnectModeCanvas';
import SumVariableModeCanvas from '../Canvas/SumVariableModeCanvas';
import SumVariableUiData from '../ScreenObjects/SumVariableUiData';
import DynamicVariableModeCanvas from '../Canvas/DynamicVariableModeCanvas';
import DynamicVariableUiData from '../ScreenObjects/DynamicVariableUiData';


interface Props {
    firebaseManager: FirebaseManager;
    sessionId: string;
}

interface State {
    mode: UiMode,
    components: ComponentUiData[];
    selectedComponentId: string | null;
}

export default class SimulationScreen extends React.Component<Props, State> {

    private readonly dm: FirebaseDataModel;

    constructor(props: Props) {
        super(props);
        this.state = {
            mode: UiMode.MOVE,
            components: [],
            selectedComponentId: null
        };
        this.dm = new FirebaseDataModelImpl(this.props.firebaseManager);
        document.title = applicationConfig.appName;
    }

    componentDidMount() {
        const isPointerComponentType = (componentType: string) => {
            switch (componentType) {
                case schema.ComponentType.STOCK.toString(): return false;
                case schema.ComponentType.PARAMETER.toString(): return false;
                case schema.ComponentType.VARIABLE.toString(): return false;
                case schema.ComponentType.SUM_VARIABLE.toString(): return false;
                case schema.ComponentType.FLOW.toString(): return true;
                case schema.ComponentType.CONNECTION.toString(): return true;
                default: throw new Error("Unknown component: " + componentType);
            }
        }
        const getComponentType = (data: any) => data.type as string;
        this.dm.subscribeToAllComponents(
            this.props.sessionId,
            (snapshot: DataSnapshot) => {
                if (snapshot.exists() && snapshot.key) {
                    // Load objects s.t. stocks are loaded before flows, and all pointable components are loaded before pointers that reference them.
                    const nonPointerComponents: ComponentUiData[] = Object.entries(snapshot.val())
                        .filter(([_, v]) => !isPointerComponentType(getComponentType(v)))
                        .map(([k, v]) => this.createUiComponent(schema.createFirebaseDataComponent(k, v)));

                    const flowComponents: ComponentUiData[] = Object.entries(snapshot.val())
                        .filter(([_, v]) => getComponentType(v) === schema.ComponentType.FLOW)
                        .map(([k, v]) => this.createUiComponent(schema.createFirebaseDataComponent(k, v)));

                    const nonFlowPointerComponents: ComponentUiData[] = Object.entries(snapshot.val())
                        .filter(([_, v]) => isPointerComponentType(getComponentType(v)) && getComponentType(v) !== schema.ComponentType.FLOW.toString())
                        .map(([k, v]) => this.createUiComponent(schema.createFirebaseDataComponent(k, v)));

                    const components: ComponentUiData[] = nonPointerComponents.concat(flowComponents).concat(nonFlowPointerComponents);

                    let selectedComponentId: string | null = this.state.selectedComponentId;
                    if (!components.find(c => c.getId() === selectedComponentId)) {
                        selectedComponentId = null;
                    }
                    this.setState({
                        ...this.state,
                        selectedComponentId,
                        components
                    });
                }
            }
        );
    }

    render() {
        const setMode = (mode: UiMode) => {
            this.setState({ ...this.state, mode });
        }
        const selectedComponent = this.state.selectedComponentId
            ? this.state.components.find(c => c.getId() === this.state.selectedComponentId)
            : undefined;
        return (
            <React.Fragment>
                <Toolbar
                    mode={this.state.mode}
                    setMode={setMode}
                    sessionId={this.props.sessionId}
                />
                {
                    this.createCanvasForMode(
                        this.state.mode,
                        {
                            firebaseDataModel: this.dm,
                            sessionId: this.props.sessionId,
                            children: this.state.components,
                            selectedComponentId: this.state.selectedComponentId,
                            addComponent: (c) => this.addComponent(c),
                            editComponent: (c) => this.updateComponent(c),
                            deleteComponent: (id) => this.removeComponent(id),
                            setSelected: (id) => this.setSelected(id)
                        }
                    )
                }
                {
                    (selectedComponent && this.shouldShowEditBox()) &&
                    <EditBox
                        initialComponent={selectedComponent.getDatabaseObject()}
                        handleCancel={() => this.setSelected(null)}
                        handleSave={(comp: schema.FirebaseDataComponent<any>) => {
                            const components: ComponentUiData[] = this.state.components
                                .filter(c => c.getId() !== comp.getId())
                                .concat(this.createUiComponent(comp));
                            this.dm.updateComponent(this.props.sessionId, comp);
                            this.setState({ ...this.state, components, selectedComponentId: null });
                        }}
                    />
                }
            </React.Fragment >
        );
    }

    private createCanvasForMode(mode: UiMode, props: CanvasProps): JSX.Element {
        switch (mode) {
            case UiMode.MOVE:
                return (
                    <MoveModeCanvas
                        {...props}
                    />
                );
            case UiMode.STOCK:
                return (
                    <StockModeCanvas
                        {...props}
                    />
                );
            case UiMode.FLOW:
                return (
                    <FlowModeCanvas
                        {...props}
                    />
                );
            case UiMode.DELETE:
                return (
                    <DeleteModeCanvas
                        {...props}
                    />
                );
            case UiMode.EDIT:
                return (
                    <EditModeCanvas
                        {...props}
                    />
                );
            case UiMode.PARAM:
                return (
                    <ParamModeCanvas
                        {...props}
                    />
                );
            case UiMode.SUM_VARIABLE:
                return (
                    <SumVariableModeCanvas
                        {...props}
                    />
                );
            case UiMode.CONNECT:
                return (
                    <ConnectModeCanvas
                        {...props}
                    />
                );
            case UiMode.DYN_VARIABLE:
                return (
                    <DynamicVariableModeCanvas
                        {...props}
                    />
                );
            default:
                throw new Error("Unknown UI Mode");
        }
    }

    private shouldShowEditBox(): boolean {
        return this.state.mode === UiMode.EDIT;
    }

    private addComponent(newComponent: ComponentUiData): void {
        if (!this.state.components.find(c => c.getId() === newComponent.getId())) {
            this.setState(
                {
                    ...this.state,
                    selectedComponentId: null,
                    components: this.state.components.concat([newComponent])
                }
            );
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
        }
    }

    private removeComponent(id: string): void {
        const component = this.state.components.find(c => c.getId() === id);
        if (component) {
            this.setState(
                {
                    ...this.state,
                    components: this.state.components.filter(c => c.getId() !== id)
                }
            );
            this.dm.removeComponent(this.props.sessionId, id);
            // todo check for orphans
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
        }
    }
}
