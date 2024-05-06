import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseTextComponent, { FirebaseTextData } from "./FirebaseTextComponent";

export default class FirebaseCausalLoopVertex
    extends FirebaseTextComponent<FirebaseTextData>
{

    public static readonly EMPTY_VERTEX_TEXT = "Vertex";

    public getType(): ComponentType {
        return ComponentType.CLD_VERTEX;
    }

    public withData(d: FirebaseTextData): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(this.getId(), d);
    }

    public withId(id: string): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(
            id,
            Object.assign({}, this.getData())
        );
    }

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.cldVertex.defaultWidthPx,
                height: theme.custom.maxgraph.cldVertex.defaultHeightPx,
                text: FirebaseCausalLoopVertex.EMPTY_VERTEX_TEXT,
                bold: false,
                italic: false,
                underline: false,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize
            }
        );
    }

    public static toVertexComponentData(d: any): FirebaseTextData {
        return FirebaseTextComponent.toTextComponentData(d);
    }
}
