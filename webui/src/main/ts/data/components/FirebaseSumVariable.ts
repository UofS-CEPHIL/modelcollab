import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseTextData
} from "./FirebaseTextComponent";

export default class FirebaseSumVariable
    extends FirebaseTextComponent<FirebaseTextData>
{
    public getType(): ComponentType {
        return ComponentType.SUM_VARIABLE;
    }

    public withData(d: Partial<FirebaseTextData>): FirebaseSumVariable {
        return new FirebaseSumVariable(
            this.getId(),
            {
                ...this.getData(),
                ...d
            }
        );
    }

    public withId(id: string): FirebaseSumVariable {
        return new FirebaseSumVariable(id, Object.assign({}, this.getData()));
    }

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseSumVariable {
        return new FirebaseSumVariable(
            id,
            {
                x,
                y,
                text: "Sum Var",
                width: theme.custom.maxgraph.textComponent.defaultWidthPx,
                height: theme.custom.maxgraph.textComponent.defaultHeightPx,
                bold: false,
                italic: false,
                underline: false,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                color: theme.palette.canvas.contrastText,
            }
        );
    }

    public static toSumVariableComponentData(d: any): FirebaseTextData {
        return FirebaseTextComponent.toTextComponentData(d);
    }
}
