import { createTheme } from "@mui/material";


// Declare custom vars in theme
declare module '@mui/material/styles' {
    // Custom palette colors
    interface Palette {
        canvas: Palette['primary'];
        grayed: Palette['primary'];
    }

    interface PaletteOptions {
        canvas?: PaletteOptions['primary'];
        grayed?: PaletteOptions['primary'];
    }
    // Custom theme variables
    interface Theme {
        custom: {
            sidebar: {
                dragHandle: {
                    color: string,
                    width: string,
                },
                defaultWidthPx: number,
                maxWidthPx: number,
                minWidthPx: number,
                defaultVisibility: boolean
            },
            maxgraph: {
                connection: {
                    strokeWidthPx: number,
                    edgeStyle: string,
                    endArrow: string
                },
                flow: {
                    strokeWidthPx: number,
                    shape: string,
                    edgeStyle: string,
                },
                cloud: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                },
                stock: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    strokeWidth: number,
                },
                cldVertex: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    strokeWidth: number,
                },
                cldLink: {
                    strokeWidthPx: number,
                    edgeStyle: string,
                    endArrow: string,
                    fontSize: number,
                },
                stickynote: {
                    color: string,
                    strokeWidth: number,
                    defaultHeightPx: number,
                    defaultWidthPx: number,
                },
                textComponent: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    defaultFontSize: number
                },
                canvas: {
                    borderWidthPx: number
                },
                loopIcon: {
                    strokeWidth: number,
                    fontSize: number,
                    arrowHeadWidth: number,
                    arrowHeadHeight: number,
                    defaultWidthPx: number,
                },
            },
            modal: {
                position: string,
                top: string,
                left: string,
                transform: string,
                width: number,
                bgcolor: string,
                border: string,
                boxShadow: number,
                p: number,
            }
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        custom?: {
            sidebar?: {
                dragHandle?: {
                    color?: string,
                    width?: string,
                },
                defaultWidthPx?: number,
                maxWidthPx?: number,
                minWidthPx?: number,
                defaultVisibility?: boolean
            },
            maxgraph?: {
                connection?: {
                    strokeWidthPx?: number,
                    edgeStyle?: string,
                    endArrow?: string
                },
                flow?: {
                    strokeWidthPx?: number,
                    shape?: string,
                    edgeStyle?: string,
                },
                cloud?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                },
                stock?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    strokeWidth?: number,
                },
                cldVertex?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    strokeWidth?: number,
                },
                cldLink?: {
                    strokeWidthPx?: number,
                    edgeStyle?: string,
                    endArrow?: string,
                    fontSize?: number,
                },
                stickynote: {
                    color?: string,
                    strokeWidth?: number,
                    defaultHeightPx?: number,
                    defaultWidthPx?: number,
                },
                textComponent?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    defaultFontSize?: number,
                },
                canvas?: {
                    borderWidthPx?: number
                },
                loopIcon?: {
                    strokeWidth?: number,
                    fontSize?: number,
                    arrowHeadWidth?: number,
                    arrowHeadHeight?: number,
                    defaultWidthPx?: number,
                },
            },
            modal?: {
                position?: string,
                top?: string,
                left?: string,
                transform?: string,
                width?: number,
                border?: string,
                bgcolor: string,
                boxShadow?: number,
                p?: number,
            }
        };
    }
}

export const theme = createTheme({
    spacing: 8,
    palette: {
        primary: {
            main: "#1565c0",
            light: "#4383cc",
            dark: "#0e4686",
            contrastText: "#fff"
        },
        secondary: {
            main: "#ffa000",
            light: "#ffb333",
            dark: "#b27000",
            contrastText: "#fff"
        },
        error: {
            main: "#c62828",
            light: "#d15353",
            dark: "#8a1c1c",
            contrastText: "#fff"
        },
        grayed: {
            main: "#9B9F9F",
        },
        canvas: {
            main: "#ffffff",
            contrastText: "#000000"
        }

    },
    custom: {
        sidebar: {
            dragHandle: {
                color: "#CBD1D5",
                width: "5px",
            },
            defaultWidthPx: 300,
            maxWidthPx: 800,
            minWidthPx: 50,
            defaultVisibility: false
        },
        maxgraph: {
            connection: {
                strokeWidthPx: 2,
                edgeStyle: "orthogonalEdgeStyle",
                endArrow: "classic",
            },
            flow: {
                strokeWidthPx: 2,
                shape: "arrowConnector",
                edgeStyle: "elbowEdgeStyle",
            },
            cloud: {
                defaultWidthPx: 50,
                defaultHeightPx: 50,
            },
            stock: {
                defaultWidthPx: 80,
                defaultHeightPx: 50,
                strokeWidth: 1.5,
            },
            cldVertex: {
                defaultWidthPx: 80,
                defaultHeightPx: 50,
                strokeWidth: 1.5
            },
            cldLink: {
                strokeWidthPx: 3,
                edgeStyle: "orthogonalEdgeStyle",
                endArrow: "classic",
                fontSize: 20,
            },
            stickynote: {
                color: "rgba(243, 245, 39, 0.57)",
                strokeWidth: 1,
                defaultHeightPx: 120,
                defaultWidthPx: 120,
            },
            textComponent: {
                defaultWidthPx: 80,
                defaultHeightPx: 25,
                defaultFontSize: 14,
            },
            canvas: {
                borderWidthPx: 1
            },
            loopIcon: {
                strokeWidth: 2,
                fontSize: 30,
                arrowHeadWidth: 10,
                arrowHeadHeight: 10,
                defaultWidthPx: 50,
            }
        },
        modal: {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        }
    }
});
