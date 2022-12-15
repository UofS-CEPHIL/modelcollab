import FirebaseDataModel from "../../data/FirebaseDataModel";
import { ExtensibleEditBox, Props as BaseProps, State as BaseState } from "./EditBox";
import ScenarioFirebaseComponent from "database/build/components/Scenario/ScenarioFirebaseComponent";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";
import ComponentType from "database/build/ComponentType";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";

export interface Props extends BaseProps<ScenarioFirebaseComponent> {
    initialComponent: ScenarioFirebaseComponent;
    handleSave: (c: ScenarioFirebaseComponent) => void;
    handleCancel: () => void;
    db: FirebaseDataModel;
    sessionId: string;
}

export interface State extends BaseState<ScenarioFirebaseComponent> {
    component: ScenarioFirebaseComponent;
    allModelComponents: FirebaseDataComponent<any>[];
}

export default class ScenarioEditBox extends ExtensibleEditBox
    <ScenarioFirebaseComponent, Props, State>
{

    public constructor(props: Props) {
        super(props)
        this.state = { component: props.initialComponent, allModelComponents: [] };
    }

    componentDidMount(): void {
        this.props.db.subscribeToSession(
            this.props.sessionId,
            cpts => this.setState({ ...this.state, allModelComponents: cpts })
        );
    }

    public getComponentTypeString(): string {
        return "Scenario";
    }

    public getComponentType(): ComponentType {
        return ComponentType.SCENARIO;
    }

    private getParameters(): ParameterFirebaseComponent[] {
        return this.state.allModelComponents.filter(c => c.getType() === ComponentType.PARAMETER);
    }

    protected getFieldsAndLabels(): { [field: string]: string } {
        return Object.fromEntries(
            this.getParameters().map(p => [p.getData().text, p.getData().text])
        );
    }

    protected getValueForField(fieldName: string): string {
        const override = this.state.component.getData().paramOverrides[fieldName];
        if (override) {
            return override;
        }
        else {
            return this.getParameters().find(p => p.getData().text === fieldName)?.getData().value
                || "Error: Cannot find parameter " + fieldName;
        }
    }

    protected updateComponent(
        old: ScenarioFirebaseComponent,
        field: string,
        value: string
    ): ScenarioFirebaseComponent {
        const paramOverrides = { ...old.getData().paramOverrides, [field]: value };
        return old.withData({ ...old.getData(), paramOverrides });
    }
}


