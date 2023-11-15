import { FirebaseComponentModel as schema } from "database/build/export";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import { ExtensibleEditBox, Props as BaseProps, State as BaseState } from "./EditBox";

export interface Props extends BaseProps<schema.ScenarioFirebaseComponent> {
    initialComponent: schema.ScenarioFirebaseComponent;
    handleSave: (c: schema.ScenarioFirebaseComponent) => void;
    handleCancel: () => void;
    db: FirebaseDataModel;
    sessionId: string;
}

export interface State extends BaseState<schema.ScenarioFirebaseComponent> {
    component: schema.ScenarioFirebaseComponent;
    allModelComponents: schema.FirebaseDataComponent<any>[];
}

export default class ScenarioEditBox extends ExtensibleEditBox
    <schema.ScenarioFirebaseComponent, Props, State>
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

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.SCENARIO;
    }

    private getParameters(): schema.ParameterFirebaseComponent[] {
        return this.state.allModelComponents.filter(c => c.getType() === schema.ComponentType.PARAMETER);
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
        old: schema.ScenarioFirebaseComponent,
        field: string,
        value: string
    ): schema.ScenarioFirebaseComponent {
        const paramOverrides = { ...old.getData().paramOverrides, [field]: value };
        return old.withData({ ...old.getData(), paramOverrides });
    }
}


