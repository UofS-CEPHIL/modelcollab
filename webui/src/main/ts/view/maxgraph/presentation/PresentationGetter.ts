import FirebaseComponent from "../../../data/components/FirebaseComponent";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PresentationGetter {
    public abstract getRelevantPresentation(
        component: FirebaseComponent
    ): ComponentPresentation<any>;
}
