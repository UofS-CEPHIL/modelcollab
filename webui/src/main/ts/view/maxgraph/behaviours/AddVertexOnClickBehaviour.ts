import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export default abstract class AddVertexOnClickBehaviour
    extends DefaultBehaviour {

    protected abstract createComponent(
        x: number,
        y: number,
        id: string
    ): FirebasePointComponent<any>;

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        this.getActions().addComponent(this.createComponent(x, y, newId));
    }
}
