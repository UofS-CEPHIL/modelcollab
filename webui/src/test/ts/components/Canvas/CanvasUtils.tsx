import { UiMode } from "../../../../main/ts/UiMode";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import { CloudModeCanvasSpy, VariableModeCanvasSpy, EditModeCanvasSpy, FlowModeCanvasSpy, MoveModeCanvasSpy, ConnectionModeCanvasSpy, ParameterModeCanvasSpy, StockModeCanvasSpy, SumVarModeCanvasSpy, DeleteModeCanvasSpy } from "./MockCanvas";
import { ReactElement } from "react";


export default class CanvasUtils {

    public static NO_OP(): void { }

    public static createCanvasWithMocksForMode(mode: UiMode, props: CanvasProps): ReactElement {
        switch (mode) {
            case UiMode.CLOUD:
                return new CloudModeCanvasSpy(props).render();
            case UiMode.CONNECT:
                return new ConnectionModeCanvasSpy(props).render();
            case UiMode.DELETE:
                return new DeleteModeCanvasSpy(props).render();
            case UiMode.DYN_VARIABLE:
                return new VariableModeCanvasSpy(props).render();
            case UiMode.EDIT:
                return new EditModeCanvasSpy(props).render();
            case UiMode.FLOW:
                return new FlowModeCanvasSpy(props).render();
            case UiMode.MOVE:
                return new MoveModeCanvasSpy(props).render();
            case UiMode.PARAM:
                return new ParameterModeCanvasSpy(props).render();
            case UiMode.STOCK:
                return new StockModeCanvasSpy(props).render();
            case UiMode.SUM_VARIABLE:
                return new SumVarModeCanvasSpy(props).render()
        }
    }
}
