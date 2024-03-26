import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseNameValueData
} from "./FirebaseTextComponent";

export default class FirebaseParameter
    extends FirebaseTextComponent<FirebaseNameValueData>
{
    public getType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    public withData(d: FirebaseNameValueData): FirebaseParameter {
        return new FirebaseParameter(this.getId(), d);
    }

    public withId(id: string): FirebaseParameter {
        return new FirebaseParameter(id, Object.assign({}, this.getData()));
    }

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseParameter {
        return new FirebaseParameter(
            id,
            {
                x,
                y,
                value: "",
                text: "",
                width: theme.custom.maxgraph.textComponent.defaultWidthPx,
                height: theme.custom.maxgraph.textComponent.defaultHeightPx,
            }
        );
    }

    public static toParameterComponentData(d: any): FirebaseNameValueData {
        return FirebaseTextComponent.toNameValueComponentData(d);
    }

}
