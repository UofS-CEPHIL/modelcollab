import { Cell, CellStyle } from "@maxgraph/core";
import FirebaseTextComponent from "../../../data/components/FirebaseTextComponent";
import MCGraph from "../MCGraph";
import RectangleComponentPresentation from "./RectangleComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends FirebaseTextComponent<any>>
    extends RectangleComponentPresentation<DataType>
{

    public static decodeFontStyle(
        style: number
    ): { bold: boolean, italic: boolean, underline: boolean } {
        var bold = false, underline = false, italic = false;
        if (style >= 4) {
            underline = true;
            style -= 4;
        }
        if (style >= 2) {
            italic = true;
            style -= 2;
        }
        if (style >= 1) {
            bold = true;
            style -= 1;
        }

        return { bold, underline, italic }
    }

    public static encodeFontStyle(
        bold: boolean,
        italic: boolean,
        underline: boolean
    ): number {
        var fontStyle = 0;
        if (bold) fontStyle += 1;
        if (italic) fontStyle += 2;
        if (underline) fontStyle += 4;
        return fontStyle;
    }

    protected getStrokeColor(c: DataType): string {
        return this.hasVisibleStroke(c) ? c.getData().color : "none";
    }

    protected getStyle(
        component: DataType,
        isInner: boolean = false
    ): CellStyle {
        return {
            ...super.getStyle(component, isInner),
            fontSize: component.getData().fontSize,
            fontStyle: TextComponentPresentation.encodeFontStyle(
                component.getData().bold,
                component.getData().italic,
                component.getData().underline,
            ),
            fontColor: component.getData().color,
            strokeColor: this.getStrokeColor(component),
        }
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        graph: MCGraph
    ): DataType {
        const update: DataType = super.updateComponent(component, cell, graph);
        const { bold, italic, underline } = TextComponentPresentation
            .decodeFontStyle(cell.getStyle().fontStyle ?? 0);

        return update.withData({
            ...update.getData(),
            text: cell.getValue().getData().text,
            bold,
            italic,
            underline,
        }) as DataType;
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
    ): void {
        super.updateCell(component, cell, graph);
        const style = {
            ...cell.getStyle(),
            ...this.getStyle(component)
        };
        graph.batchUpdate(() =>
            graph.getDataModel().setStyle(cell, style)
        );
    }

    public hasVisibleStroke(_: DataType): boolean {
        return true;
    }
}
