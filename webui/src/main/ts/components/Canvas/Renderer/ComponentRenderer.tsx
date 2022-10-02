import { ReactElement } from "react";
import { Props as CloudProps } from "../ScreenObjects/Cloud/Cloud";
import { Props as TextProps } from '../ScreenObjects/TextObject';
import { Props as ConnectionProps } from "../ScreenObjects/Connection/Connection";
import { Props as FlowProps } from '../ScreenObjects/Flow/Flow';
import { Props as StaticModelProps } from "../ScreenObjects/StaticModel/StaticModel";
import { Props as StockProps } from "../ScreenObjects/Stock/Stock";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import ComponentCollection from "../ComponentCollection";

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
