import { Point } from "../components/Canvas/BaseCanvas";
import { FLOW_LABEL_DEFAULT_WIDTH, FLOW_LABEL_DEFAULT_HEIGHT } from "../components/ScreenObjects/Flow"

export class LabelUtils {
    calculateLabelComponent = ({ dx, dy, canvasXOffset, canvasYOffset, canvasWidth, canvasHeight }: { dx: number, dy: number, canvasXOffset: number, canvasYOffset: number, canvasWidth: number, canvasHeight: number },
    ): { labelPoint: Point } => {
        let labelPoint = { x: 0, y: 0 };

        if (dx > 0 && dy <= 0) {
            let x = canvasXOffset + (canvasWidth / 2) - FLOW_LABEL_DEFAULT_WIDTH;
            if (x < -1) {
                x = canvasXOffset + (canvasWidth / 2);
            }

            let y = canvasYOffset + (canvasHeight / 2) - FLOW_LABEL_DEFAULT_HEIGHT;
            if (y < -1) {
                y = canvasXOffset + (canvasHeight / 2);
            }
            labelPoint = { x: x, y: y }
            return { labelPoint };
        }

        else if (dx >= 0 && dy > 0) {
            let x = canvasXOffset + (canvasWidth / 2);
            let y = canvasYOffset + (canvasHeight / 2) - FLOW_LABEL_DEFAULT_HEIGHT;
            if (y < -1) {
                y = canvasYOffset + (canvasHeight / 2)
            }
            labelPoint = { x: x, y: y }
            return { labelPoint };
        }

        else if (dx < 0 && dy >= 0) {
            let x = canvasXOffset + (canvasWidth / 2);
            let y = canvasYOffset + (canvasHeight / 2);

            labelPoint = { x: x, y: y }
            return { labelPoint };
        }
        else if (dx <= 0 && dy < 0) {
            let x = canvasXOffset + (canvasWidth / 2) - FLOW_LABEL_DEFAULT_WIDTH;
            if (x < -1) {
                x = canvasXOffset + (canvasWidth / 2);
            }
            let y = canvasYOffset + (canvasHeight / 2);

            labelPoint = { x: x, y: y }
            return { labelPoint };
        }

        return { labelPoint };

    }
}
