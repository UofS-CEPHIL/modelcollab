import { FirebaseComponentModel as schema } from "database/build/export";
import { Component, createRef, Fragment, ReactElement, RefObject } from 'react';
import { Props as CanvasProps } from './Canvas';
import CanvasToolbar from './CanvasToolbar';
import { Cell, Graph, RubberBandHandler } from '@maxgraph/core';
import UserControls from './UserControls';
import { UiMode } from '../../UiMode';

interface Props {
    // firebaseDataModel: FirebaseDataModel;
    // sessionId: string;
    // returnToSessionSelect: () => void;
}

interface State {
    mode: UiMode;
    clipboard: Cell[];
    components: schema.FirebaseDataComponent<any>[];

    // loadedModels: LoadedStaticModel[];
    // selectedScenario: string;
}

export default class CanvasScreen extends Component<Props, State> {

    public static readonly INIT_MODE = UiMode.MOVE;

    private graphRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    private graph: Graph | null = null;
    private controls: UserControls | null = null;

    public constructor(props: CanvasProps) {
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
            this.graph = new Graph(this.graphRef.current);
            new RubberBandHandler(this.graph);
            this.controls = new UserControls(
                this.graph,
                c => this.setState({ clipboard: c }),
                () => this.state.clipboard,
                () => this.state.components
            );
        }
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
                        style={{ "width": "100%", "height": "1000px" }}
                    />
                }
            </Fragment >
        );
    }


}
