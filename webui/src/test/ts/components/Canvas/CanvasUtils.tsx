import { UiMode } from "../../../../main/ts/UiMode";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import { CloudModeCanvasMock, VariableModeCanvasMock, EditModeCanvasMock, FlowModeCanvasMock, MoveModeCanvasMock, ConnectionModeCanvasMock, ParameterModeCanvasMock, StockModeCanvasMock, SumVarModeCanvasMock, DeleteModeCanvasMock } from "./CanvasWithMocks";
import { ReactElement } from "react";


export default class CanvasUtils {

    public static NO_OP(): void { }

    public static createCanvasWithMocksForMode(mode: UiMode, props: CanvasProps): ReactElement {
        switch (mode) {
            case UiMode.CLOUD:
                return new CloudModeCanvasMock(props).render();
            case UiMode.CONNECT:
                return new ConnectionModeCanvasMock(props).render();
            case UiMode.DELETE:
                return new DeleteModeCanvasMock(props).render();
            case UiMode.DYN_VARIABLE:
                return new VariableModeCanvasMock(props).render();
            case UiMode.EDIT:
                return new EditModeCanvasMock(props).render();
            case UiMode.FLOW:
                return new FlowModeCanvasMock(props).render();
            case UiMode.MOVE:
                return new MoveModeCanvasMock(props).render();
            case UiMode.PARAM:
                return new ParameterModeCanvasMock(props).render();
            case UiMode.STOCK:
                return new StockModeCanvasMock(props).render();
            case UiMode.SUM_VARIABLE:
                return new SumVarModeCanvasMock(props).render()
        }
    }
}
