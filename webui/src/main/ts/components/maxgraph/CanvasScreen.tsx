import { FirebaseComponentModel as schema } from "database/build/export";
import { Component, createRef, Fragment, ReactElement, RefObject } from 'react';
import CanvasToolbar from './CanvasToolbar';
import { Cell, InternalEvent, RubberBandHandler } from '@maxgraph/core';
import UserControls from './UserControls';
import { UiMode } from '../../UiMode';
import StockFlowGraph from "./StockFlowGraph";
import DiagramActions from "./DiagramActions";
import FirebaseDataModel from "../../data/FirebaseDataModel";

import "../style/mxstyle.css";

interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    // returnToSessionSelect: () => void;
}

interface State {
    mode: UiMode;
    clipboard: schema.FirebaseDataComponent<any>[];
    components: schema.FirebaseDataComponent<any>[];

    // loadedModels: LoadedStaticModel[];
    // selectedScenario: string;
}

export default class CanvasScreen extends Component<Props, State> {

    public static readonly INIT_MODE = UiMode.MOVE;

    private graphRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    private graph: StockFlowGraph | null = null;
    private controls: UserControls | null = null;
    private actions: DiagramActions | null = null;

    public constructor(props: Props) {
        super(props);
        this.state = {
            mode: CanvasScreen.INIT_MODE,
            clipboard: [],
            components: []
        };
    }

    public componentDidMount(): void {
        // Set up the graph only if the ref has been created but the graph
        // hasn't been created yet
        if (this.graphRef.current && !this.graph) {
            // Allow right-click on canvas
            InternalEvent.disableContextMenu(this.graphRef.current);
            this.graph = new StockFlowGraph(
                this.graphRef.current,
                () => this.state.components
            );
            this.actions = new DiagramActions(
                this.props.firebaseDataModel,
                this.graph,
                this.props.sessionId,
                components => this.setState({ components }),
                () => this.state.components
            );
            new RubberBandHandler(this.graph);
            this.controls = new UserControls(
                this.graph,
                this.actions,
                c => this.setState({ clipboard: c }),
                () => this.pasteComponents(),
                () => this.state.components
            );
        }
    }

    private pasteComponents(): schema.FirebaseDataComponent<any>[] {
        const components = this.state.clipboard;
        // TODO assign new IDs
        this.setState({ clipboard: [] });
        return components;
    }

    private setMode(mode: UiMode): void {
        if (!this.controls) throw new Error("Not initialized");
        this.controls?.changeMode(mode);
        this.setState({ mode });
    }

    public render(): ReactElement {
        return (
            <Fragment>
                {
                    <CanvasToolbar
                        onModeChanged={mode => this.setMode(mode)}
                    />
                }
                {
                    // Force the graph to 1000px for now. There's some sort of
                    // panning mechanism built into maxgraph -- TODO Figure out
                    // how to use it
                    <div
                        id="graph-container"
                        ref={this.graphRef}
                    />
                }
            </Fragment>
        );
    }


}
