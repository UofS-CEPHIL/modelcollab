import { AlignValue } from "@maxgraph/core";
import { alpha, createTheme } from "@mui/material";


declare module '@mui/material/Button' {
    interface ButtonPropsSizeOverrides {
        xsmall: true;
    }
}

// Declare custom vars in theme
declare module '@mui/material/styles' {

    // Parameters for arrow handles
    interface HandleTheme {
        width?: number,
        strokeWidth?: number,
        strokeColor?: string,
        strokeOpacity?: number,
        fillOpacity?: number,
        fillColor?: string,
    }

    interface HandleThemes {
        terminalHandle?: HandleTheme,
        innerHandle?: HandleTheme,
        labelHandle?: HandleTheme,
    }

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
                connection: HandleThemes & {
                    strokeWidthPx: number,
                    endSizePx: number,
                    edgeStyle: string,
                    endArrow: string,
                },
                flow: HandleThemes & {
                    strokeWidthPx: number,
                    endSizePx: number,
                    edgeStyle: string,
                    valveHeightPx: number,
                    valveWidthPx: number,
                    valveStrokePx: number,
                },
                cloud: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                },
                stock: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    strokeWidth: number,
                    rounded: boolean,
                },
                param: {
                    strokeColor: string,
                    strokeWidth: number,
                    dashed: boolean,
                },
                dynvar: {
                    strokeColor: string,
                    strokeWidth: number,
                    dashed: boolean,
                },
                sumvar: {
                    strokeWidth: 3,
                    dashed: boolean,
                },
                cldVertex: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    strokeWidth: number,
                },
                cldLink: HandleThemes & {
                    strokeWidthPx: number,
                    endSizePx: number,
                    edgeStyle: string,
                    endArrow: string,
                    fontSize: number,
                },
                stickynote: {
                    color: string,
                    strokeWidth: number,
                    defaultHeightPx: number,
                    defaultWidthPx: number,
                    fillOpacity: number,
                },
                textComponent: {
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    defaultFontSize: number,
                    defaultPadding: number,
                    defaultAlignValue: AlignValue,
                },
                arrowComponent: HandleThemes & {
                    defaultColor: string,
                },
                canvas: {
                    borderWidthPx: number,
                    hoverColor: string,
                },
                loopIcon: {
                    strokeWidth: number,
                    fontSize: number,
                    arrowHeadWidth: number,
                    arrowHeadHeight: number,
                    defaultWidthPx: number,
                },
                staticModel: {
                    strokeColor: string,
                    strokeOpacity: number,
                    strokeWidthPx: number,
                    componentPaddingPx: number,
                    defaultWidthPx: number,
                    defaultHeightPx: number,
                    fillOpacity: number,
                    rounded: boolean,
                    loadingModelWidthPx: number,
                },
                icons: {
                    sizePx: number,
                }
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
            maxgraph: {
                connection: HandleThemes & {
                    strokeWidthPx?: number,
                    endSizePx?: number,
                    edgeStyle?: string,
                    endArrow?: string,
                },
                flow?: HandleThemes & {
                    strokeWidthPx?: number,
                    endSizePx?: number,
                    edgeStyle?: string,
                    valveHeightPx?: number,
                    valveWidthPx?: number,
                    valveStrokePx?: number,
                },
                cloud?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                },
                stock?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    strokeWidth?: number,
                    rounded?: boolean,
                },
                param: {
                    strokeColor?: string,
                    strokeWidth?: number,
                    dashed?: boolean,
                },
                dynvar: {
                    strokeColor?: string,
                    strokeWidth?: number,
                    dashed?: boolean,
                },
                sumvar: {
                    strokeWidth?: number,
                    dashed?: boolean,
                },
                cldVertex?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    strokeWidth?: number,
                },
                cldLink?: HandleThemes & {
                    strokeWidthPx?: number,
                    endSizePx?: number,
                    edgeStyle?: string,
                    endArrow?: string,
                    fontSize?: number,
                },
                stickynote?: {
                    color?: string,
                    strokeWidth?: number,
                    defaultHeightPx?: number,
                    defaultWidthPx?: number,
                    fillOpacity?: number,
                },
                textComponent?: {
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    defaultFontSize?: number,
                    defaultPadding?: number,
                    defaultAlignValue?: AlignValue,
                },
                arrowComponent?: HandleThemes & {
                    defaultColor: string,
                },
                staticModel?: {
                    strokeColor?: string,
                    strokeOpacity?: number,
                    strokeWidthPx?: number,
                    componentPaddingPx?: number,
                    defaultWidthPx?: number,
                    defaultHeightPx?: number,
                    fillOpacity?: number,
                    rounded?: boolean,
                    loadingModelWidthPx?: number,
                },
                canvas?: {
                    borderWidthPx?: number,
                    hoverColor?: string,
                },
                loopIcon?: {
                    strokeWidth?: number,
                    fontSize?: number,
                    arrowHeadWidth?: number,
                    arrowHeadHeight?: number,
                    defaultWidthPx?: number,
                },
                icons: {
                    sizePx?: number,
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

const palette = {
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
    },
};

export const theme = createTheme({
    spacing: 8,
    palette,
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
                endSizePx: 5,
                edgeStyle: "orthogonalEdgeStyle",
                endArrow: "classic",
                labelHandle: {
                    width: 0,
                    strokeWidth: 0,
                    strokeColor: palette.canvas.main,
                    strokeOpacity: 0.0,
                    fillColor: palette.canvas.main,
                    fillOpacity: 0.0,
                }
            },
            flow: {
                strokeWidthPx: 2,
                endSizePx: 10,
                edgeStyle: "elbowEdgeStyle",
                valveHeightPx: 18,
                valveWidthPx: 9,
                valveStrokePx: 2,
            },
            cloud: {
                defaultWidthPx: 50,
                defaultHeightPx: 50,
            },
            stock: {
                defaultWidthPx: 80,
                defaultHeightPx: 50,
                strokeWidth: 1.5,
                rounded: true,
            },
            param: {
                strokeColor: palette.canvas.main,
                strokeWidth: 1,
                dashed: false,
            },
            dynvar: {
                strokeColor: palette.canvas.main,
                strokeWidth: 1,
                dashed: false,
            },
            sumvar: {
                strokeWidth: 2,
                dashed: false,
            },
            cldVertex: {
                defaultWidthPx: 80,
                defaultHeightPx: 50,
                strokeWidth: 1.5
            },
            cldLink: {
                strokeWidthPx: 3,
                endSizePx: 5,
                edgeStyle: "orthogonalEdgeStyle",
                endArrow: "classic",
                fontSize: 20,
                labelHandle: {
                    width: 0,
                    strokeWidth: 0,
                    strokeColor: palette.canvas.main,
                    strokeOpacity: 0.0,
                    fillColor: palette.canvas.main,
                    fillOpacity: 0.0,
                }
            },
            stickynote: {
                color: "rgb(243, 245, 39)",
                strokeWidth: 1,
                defaultHeightPx: 120,
                defaultWidthPx: 120,
                fillOpacity: 57,
            },
            textComponent: {
                defaultWidthPx: 140,
                defaultHeightPx: 30,
                defaultFontSize: 18,
                defaultPadding: 30,
                defaultAlignValue: "left"
            },
            arrowComponent: {
                labelHandle: {
                    width: 8,
                    strokeWidth: 1,
                    strokeColor: palette.canvas.contrastText,
                    strokeOpacity: 100,
                    fillColor: palette.grayed.main,
                    fillOpacity: 100,
                },
                terminalHandle: {
                    width: 8,
                    strokeWidth: 1,
                    strokeColor: palette.canvas.contrastText,
                    strokeOpacity: 100,
                    fillOpacity: 100,
                    fillColor: palette.primary.main,
                },
                innerHandle: {
                    width: 8,
                    strokeWidth: 1,
                    strokeColor: palette.canvas.contrastText,
                    strokeOpacity: 100,
                    fillOpacity: 100,
                    fillColor: palette.secondary.main,
                },
                defaultColor: palette.primary.main,
            },
            staticModel: {
                strokeColor: palette.canvas.contrastText,
                strokeOpacity: 100,
                strokeWidthPx: 1,
                componentPaddingPx: 15,
                defaultWidthPx: 100,
                defaultHeightPx: 100,
                fillOpacity: 25,
                rounded: true,
                loadingModelWidthPx: 10,
            },
            canvas: {
                borderWidthPx: 1,
                hoverColor: palette.secondary.main,
            },
            loopIcon: {
                strokeWidth: 2,
                fontSize: 30,
                arrowHeadWidth: 10,
                arrowHeadHeight: 10,
                defaultWidthPx: 50,
            },
            icons: {
                sizePx: 20,
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
    },
    // Styled MUI components
    components: {
        MuiButton: {
            variants: [
                {
                    props: { size: "xsmall" },
                    style: {
                        padding: "2px 2px",
                        fontSize: 10,
                        minWidth: 10,
                        minHeight: 10,
                        maxWidth: 30,
                        maxHeight: 30,
                    }
                },
            ]
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: alpha(palette.primary.main, 0.20),
                    },
                    '&:hover,&.Mui-selected:hover': {
                        backgroundColor: alpha(palette.primary.main, 0.25)
                    }
                }
            },
        },
    }
});
