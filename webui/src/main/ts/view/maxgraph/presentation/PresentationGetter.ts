import FirebaseComponent from "../../../data/components/FirebaseComponent";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PresentationGetter {
    public abstract getRelevantPresentation(
        component: FirebaseComponent
    ): ComponentPresentation<any>;

    public getNormalStrokeColorForComponent(c: FirebaseComponent): string {
        return this
            .getRelevantPresentation(c)
            .getNormalStrokeColorForComponent(c);
    }

    public getNormalTextColorForComponent(c: FirebaseComponent): string {
        return this
            .getRelevantPresentation(c)
            .getNormalTextColorForComponent(c);
    }

    public getErrorStrokeColorForComponent(c: FirebaseComponent): string {
        return this
            .getRelevantPresentation(c)
            .getErrorStrokeColorForComponent(c);
    }

    public getErrorTextColorForComponent(c: FirebaseComponent): string {
        return this
            .getRelevantPresentation(c)
            .getErrorTextColorForComponent(c);
    }
}
