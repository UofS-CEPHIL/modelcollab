import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseNameValueData
} from "./FirebaseTextComponent";

export default class FirebaseDynamicVariable
    extends FirebaseTextComponent<FirebaseNameValueData>
{

    public getType(): ComponentType {
        return ComponentType.VARIABLE;
    }

    public withData(d: FirebaseNameValueData): FirebaseDynamicVariable {
        return new FirebaseDynamicVariable(this.getId(), d);
    }

    public withId(id: string): FirebaseDynamicVariable {
        return new FirebaseDynamicVariable(
            id,
            Object.assign({}, this.getData())
        );
    }

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseDynamicVariable {
        return new FirebaseDynamicVariable(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.textComponent.defaultWidthPx,
                height: theme.custom.maxgraph.textComponent.defaultHeightPx,
                value: "",
                text: ""
            }
        );
    }

    public static toDynamicVariableComponentData(
        d: any
    ): FirebaseNameValueData {
        return FirebaseTextComponent.toNameValueComponentData(d);
    }
}
