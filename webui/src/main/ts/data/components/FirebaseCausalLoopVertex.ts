import TextComponentPresentation from "../../view/maxgraph/presentation/TextComponentPresentation";
import ComponentType from "./ComponentType";
import FirebaseTextComponent, { FirebaseTextData } from "./FirebaseTextComponent";

export default class FirebaseCausalLoopVertex
    extends FirebaseTextComponent<FirebaseTextData>
{

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

    public static toVertexComponentData(d: any): FirebaseTextData {
        return FirebaseTextComponent.toTextComponentData(d);
    }
}
