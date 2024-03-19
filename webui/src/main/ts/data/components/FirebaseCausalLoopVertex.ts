import ComponentType from "./ComponentType";
import { FirebasePointData } from "./FirebasePointComponent";
import FirebaseTextComponent, { FirebaseTextData } from "./FirebaseTextComponent";

export interface FirebaseCausalLoopVertexData extends FirebasePointData {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
}

export default class FirebaseCausalLoopVertex
    extends FirebaseTextComponent<FirebaseCausalLoopVertexData>
{

    public getType(): ComponentType {
        return ComponentType.CLD_VERTEX;
    }

    public withData(d: FirebaseCausalLoopVertexData): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(this.getId(), d);
    }

    public withId(id: string): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(
            id,
            Object.assign({}, this.getData())
        );
    }

    public static toVertexComponentData(
        data: any
    ): FirebaseCausalLoopVertexData {
        const d: FirebaseCausalLoopVertexData = {
            x: Number(data.x),
            y: Number(data.y),
            text: String(data.text)
        };
        return d;
    }
}
