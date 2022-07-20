import React from 'react';

import { FirebaseComponentModel as schema } from "database/build/export";

import { Props as CanvasProps } from "../Canvas/BaseCanvas";
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


interface Props {
    firebaseManager: FirebaseManager;
    sessionId: string;
}

interface State {
    mode: UiMode,
    components: schema.FirebaseDataComponent[];
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
        this.dm.subscribeToAllComponents(
            this.props.sessionId,
            (snapshot: DataSnapshot) => {
                if (snapshot.exists() && snapshot.key) {
                    const components = Object.entries(snapshot.val())
                        .map(([k, v]) => schema.createFirebaseDataComponent(k, v));
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
                        initialComponent={selectedComponent}
                        handleCancel={() => this.setSelected(null)}
                        handleSave={(comp: schema.FirebaseDataComponent) => {
                            console.log("saving component " + comp.toString())
                            const components: schema.FirebaseDataComponent[] = this.state.components
                                .filter(c => c.getId() !== comp.getId()).concat([comp]);
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
        }
    }

    private shouldShowEditBox(): boolean {
        return this.state.mode === UiMode.EDIT;
    }

    private addComponent(newComponent: schema.FirebaseDataComponent): void {
        if (!this.state.components.find(c => c.getId() === newComponent.getId())) {
            this.setState(
                {
                    ...this.state,
                    components: this.state.components.concat([newComponent])
                }
            );
            this.dm.updateComponent(this.props.sessionId, newComponent);
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

    private updateComponent(newComponent: schema.FirebaseDataComponent): void {
        const components: schema.FirebaseDataComponent[] = this.state.components
            .filter(c => c.getId() !== newComponent.getId()).concat([newComponent]);
        this.dm.updateComponent(this.props.sessionId, newComponent);
        this.setState({ ...this.state, components });
    }

    private setSelected(selectedComponentId: string | null): void {
        if (selectedComponentId !== this.state.selectedComponentId)
            this.setState({ ...this.state, selectedComponentId });
    }
}
