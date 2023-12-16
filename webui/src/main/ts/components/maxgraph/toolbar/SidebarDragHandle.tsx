import React, { ReactElement } from "react";
import { theme } from "../../../Themes";

export interface Props {
    onChangeWidth: (width: number) => void
}

export default class SidebarDragHandle extends React.Component<Props> {

    public render(): ReactElement {
        return (
            <div
                id="drag-handle"
                style={{
                    width: theme.custom.sidebar.dragHandle.width,
                    height: "calc(100vh - 64px)",
                    backgroundColor: theme.custom.sidebar.dragHandle.color,
                    cursor: "ew-resize",
                    padding: "4px 0 0",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 100
                }}
                onMouseDown={() => this.handleMouseDownOnDragHandle()}
            />
        );

    }

    private handleMouseDownOnDragHandle() {
        const handleMoveDragHandle = (e: MouseEvent) => {
            const newWidth =
                document.body.offsetLeft
                + document.body.offsetWidth
                - e.clientX
                + 20;
            if (
                newWidth > theme.custom.sidebar.minWidthPx
                && newWidth < theme.custom.sidebar.maxWidthPx
            ) {
                this.props.onChangeWidth(newWidth);
            }
        }

        const handleMouseUpFromDragHandle = () => {
            document.removeEventListener(
                'mouseup',
                handleMouseUpFromDragHandle,
                true
            );
            document.removeEventListener(
                'mousemove',
                handleMoveDragHandle,
                true
            );
        }

        document.addEventListener(
            'mouseup',
            handleMouseUpFromDragHandle,
            true
        );
        document.addEventListener(
            'mousemove',
            handleMoveDragHandle,
            true
        );
    }
}
