import VisibleComponent from "./VisibleComponent";
import ComponentUiData from "./ComponentUiData";
import { Point, Side } from "../../DrawingUtils";

export default interface PointableComponent extends VisibleComponent {
    getArrowPoint(side: Side, components: ReadonlyArray<ComponentUiData>): Point;
    getRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;
    getAngleRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;
}
