import ComponentType from "./ComponentType";
import FirebaseTextComponent, { FirebaseTextData } from "./FirebaseTextComponent";

export default class FirebaseStickyNote
    extends FirebaseTextComponent<FirebaseTextData>
{

    public getType(): ComponentType {
        return ComponentType.STICKY_NOTE;
    }

    public withData(
        d: FirebaseTextData
    ): FirebaseTextComponent<FirebaseTextData> {
        return new FirebaseStickyNote(this.getId(), d);
    }

    public getReadableComponentName(): string {
        return `Sticky Note (#${this.getId()})`;
    }

    public withId(id: string): FirebaseTextComponent<FirebaseTextData> {
        return new FirebaseStickyNote(
            id,
            Object.assign({}, this.getData())
        );
    }
}
