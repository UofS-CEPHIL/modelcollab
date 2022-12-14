import ComponentUiData from "./ComponentUiData";
import { Point } from "../../DrawingUtils";

export default interface VisibleComponent {
    getCentrePoint(components: ReadonlyArray<ComponentUiData>): Point;
}
