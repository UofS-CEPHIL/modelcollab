import ComponentUiData from "./ComponentUiData";
import { Point, Side } from "../../DrawingUtils";
import { RectangularComponentExtensible } from "./RectangularComponent";
import TextObject from "./TextObject";
import TextComponentData from "database/build/components/Text/TextComponentData";
import TextFirebaseComponent from "database/build/components/Text/TextFirebaseComponent";

export abstract class TextComponentExtensible
    <
    DataType extends TextComponentData,
    DbObject extends TextFirebaseComponent<any>
    >
    extends RectangularComponentExtensible<DataType, DbObject> {
    public static WIDTH = 150;
    public static HEIGHT = 50;
    private static PAD = 8;

    public getArrowPoint(side: Side, _: ComponentUiData[]) {
        const defaultPoint = super.getArrowPoint(side, _);
        let xpad: number;
        let ypad: number;
        switch (side) {
            case Side.TOP:
                xpad = 0;
                ypad = -1 * TextComponent.PAD;
                break;
            case Side.BOTTOM:
                xpad = 0;
                ypad = TextComponent.PAD;
                break;
            case Side.LEFT:
                xpad = -1 * TextComponent.PAD;
                ypad = 0;
                break;
            case Side.RIGHT:
                xpad = TextComponent.PAD;
                ypad = 0;
        }
        return { x: defaultPoint.x + xpad, y: defaultPoint.y + ypad }

    }

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y };
    }

    public getWidthPx(): number {
        return TextComponent.estimateTextSize(this.getData().text, TextObject.FONT_SIZE).width;
    }

    public getHeightPx(): number {
        return TextComponent.estimateTextSize(this.getData().text, TextObject.FONT_SIZE).height;
    }

    public isPointable(): boolean {
        return true;
    }

    public static estimateTextSize(text: string, fontSize: number) {
        return { height: fontSize, width: text.length * fontSize * 0.7 };
    }
}

export default abstract class TextComponent
    extends TextComponentExtensible<TextComponentData, TextFirebaseComponent<any>> { }
