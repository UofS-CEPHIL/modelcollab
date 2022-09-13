import { ReactElement } from "react";
import { Props as CloudProps } from "../ScreenObjects/Cloud";
import { Props as TextProps } from '../ScreenObjects/TextObject';
import { Props as ConnectionProps } from "../ScreenObjects/Connection";
import { Props as FlowProps } from '../ScreenObjects/Flow';
import { Props as StaticModelProps } from "../ScreenObjects/StaticModel";
import { Props as StockProps } from "../ScreenObjects/Stock";
import StockUiData from "../ScreenObjects/StockUiData";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import ParameterUiData from "../ScreenObjects/ParameterUiData";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariableUiData";
import SumVariableUiData from "../ScreenObjects/SumVariableUiData";
import CloudUiData from "../ScreenObjects/CloudUiData";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import StaticModelUiData from "../ScreenObjects/StaticModelUiData";
import { LoadedStaticModel } from "../screens/SimulationScreen";
import ComponentCollection from "./ComponentCollection";

export type AnyProps = StockProps | FlowProps | TextProps | CloudProps | ConnectionProps | StaticModelProps;

export default interface ComponentRenderer {
    render: (
        components: ComponentCollection,
        getColor: (c: ComponentUiData) => string,
        editComponent: (c: ComponentUiData) => void,
        showConnectionHandles: boolean,
        componentsDraggable: boolean,
        xOffset?: number,
        yOffset?: number
    ) => ReactElement[];
}
