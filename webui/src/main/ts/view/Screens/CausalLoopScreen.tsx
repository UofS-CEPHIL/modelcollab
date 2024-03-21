import { ReactElement } from 'react';
import { useParams } from "react-router";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import CanvasScreen, { Props as CanvasScreenProps, State as CanvasScreenState } from './CanvasScreen';
import RestClient from "../../rest/RestClient";
import FirebaseComponent from '../../data/components/FirebaseComponent';
import { ComponentErrors } from '../../validation/ModelValitador';
import ModalBoxType from '../ModalBox/ModalBoxType';
import CausalLoopGraph from '../maxgraph/CausalLoopGraph';
import UserControls from '../maxgraph/UserControls';
import CausalLoopActions from '../maxgraph/CausalLoopActions';
import CausalLoopPresentationGetter from '../maxgraph/presentation/CausalLoopPresentationGetter';
import CanvasSidebar from '../maxgraph/toolbar/CanvasSidebar';
import { CausalLoopBehaviourGetter } from '../maxgraph/behaviours/BehaviourGetter';
import { UiMode } from '../../UiMode';
import CausalLoopSidebar from '../maxgraph/toolbar/CausalLoopSidebar';
import CausalLoopToolbar from '../maxgraph/toolbar/CausalLoopToolbar';
import FirebaseSessionDataGetter from '../../data/FirebaseSessionDataGetter';
import { Cell } from '@maxgraph/core';

interface Props extends CanvasScreenProps {
    firebaseDataModel: FirebaseDataModel;
    restClient: RestClient;
    logOut: () => void;
    modelUuid?: string;
}

interface State extends CanvasScreenState {
    modelName: string | null;
    components: FirebaseComponent[];
    clipboard: FirebaseComponent[];
    selectedComponent: FirebaseComponent | null;
    errors: ComponentErrors;
    displayedModalBox: ModalBoxType | null;
    sidebarWidth: number;
    sidebarVisible: boolean;
}

class CausalLoopScreen extends CanvasScreen<Props, State, CausalLoopGraph> {

    private static readonly presentation = new CausalLoopPresentationGetter();

    protected subscribeToFirebase(): () => void {
        return new FirebaseSessionDataGetter(
            this.props.firebaseDataModel
        ).loadCausalLoopModel(
            this.props.modelUuid!,
            n => this.setState({ modelName: n }),
            c => this.onComponentsUpdated(c),
            () => this.graph || this.setupGraph()
        );
    }

    protected onComponentsUpdated(components: FirebaseComponent[]): void {
        const tryUpdateGraph = () => {
            this.graph != null
                ? this.graph.refreshComponents(
                    components,
                    oldComponents,
                    errors
                )
                : setTimeout(tryUpdateGraph, 200);
        }
        const errors = {}; // TODO
        const oldComponents = this.state.components;
        this.setState({ components, errors });
        tryUpdateGraph();
    }

    protected makeInitialState(): State {
        return {
            modelName: null,
            components: [],
            clipboard: [],
            selectedComponent: null,
            errors: {},
            displayedModalBox: null,
            sidebarWidth: CanvasSidebar.DEFAULT_WIDTH_PX,
            sidebarVisible: CanvasSidebar.DEFAULT_VISIBILITY,
            cursorPosition: CanvasScreen.INIT_CURSOR,
            keydownPosition: null,
            keydownCell: null
        };
    }

    protected makeGraph(): CausalLoopGraph {
        return new CausalLoopGraph(
            this.graphRef.current!,
            this.props.firebaseDataModel,
            this.props.modelUuid!,
            CausalLoopScreen.presentation,
            () => this.state.components,
            () => this.state.errors
        );
    }

    protected makeActions(): CausalLoopActions {
        if (!this.graph) throw new Error("Not initialized");
        if (!this.props.modelUuid) throw new Error("No UUID found");
        return new CausalLoopActions(
            this.props.firebaseDataModel,
            new CausalLoopPresentationGetter(),
            this.graph,
            this.props.modelUuid,
            () => this.state.components
        );
    }

    protected makeUserControls(): UserControls {
        if (!this.graph || !this.actions) throw new Error("Not initialized");
        return new UserControls(
            this.graph,
            this.actions,
            new CausalLoopBehaviourGetter(),
            c => this.setState({ clipboard: c }),
            () => this.pasteComponents(),
            () => this.state.components,
            () => UiMode.MOVE,
            m => this.setState({ displayedModalBox: m }),
            s => this.setState({ selectedComponent: s }),
            () => this.state.cursorPosition,
            () => this.state.keydownPosition,
            p => this.setKeydownPosition(p),
            () => this.state.keydownCell,
            (c: Cell | null) => this.setKeydownCell(c),
        );
    }

    protected makeToolbar(): ReactElement {
        return (
            <CausalLoopToolbar
                onModeChanged={m => console.error(
                    "Mode changed to " + m + "; shouldn't be possible"
                )}
                setOpenModalBox={m => this.setState({ displayedModalBox: m })}
                modelName={this.state.modelName ?? ""}
                sessionId={this.props.modelUuid!}
                restClient={this.props.restClient}
                firebaseDataModel={this.props.firebaseDataModel}
                logOut={() => this.props.logOut()}
                toggleSidebarOpen={() => this.toggleSidebarOpen()}
                components={this.state.components}
                errors={this.state.errors}
            />
        );
    }

    protected makeSidebar(): ReactElement {
        return (
            <CausalLoopSidebar
                onResize={w => this.setState({ sidebarWidth: w })}
                getIsVisible={() => this.state.sidebarVisible}
                firebaseDataModel={this.props.firebaseDataModel}
                modelUuid={this.props.modelUuid!}
                components={this.state.components}
                selectedComponent={this.state.selectedComponent}
            />
        );
    }

    protected makeModalBoxIfNecessary(): ReactElement | null {
        // TODO
        return null;
    }

}

export default function CausalLoopScreenWithParams(props: Props) {
    let { uuid } = useParams();
    return (<CausalLoopScreen {...props} modelUuid={uuid} />);
};
