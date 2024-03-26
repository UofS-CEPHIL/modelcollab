import { theme } from "../../Themes";
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

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseStickyNote {
        return new FirebaseStickyNote(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.stickynote.defaultWidthPx,
                height: theme.custom.maxgraph.stickynote.defaultHeightPx,
                text: ""
            }
        );
    }

    public withId(id: string): FirebaseTextComponent<FirebaseTextData> {
        return new FirebaseStickyNote(
            id,
            Object.assign({}, this.getData())
        );
    }
}
