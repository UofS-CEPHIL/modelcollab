import { ListItem, ListItemIcon, ListItemText, List, Grid, Typography, Button } from '@mui/material';
import { ReactElement } from 'react';
import { UiMode } from '../../UiMode';
import ModalBox, { Props as BaseProps, State as BaseState } from '../ModalBox/ModalBox';
import CanvasScreenToolbar from '../Toolbar/CanvasScreenToolbar';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';

export interface Props extends BaseProps {
    onClose: () => void;
    width: number;
}

export interface State extends BaseState {

}

export default class HelpBox extends ModalBox<Props, State> {

    protected getBoxContents(): ReactElement {
        return (
            <Grid container>
                <Grid item xs={12} >
                    <Typography variant="h3" textAlign="center">
                        ModelCollab
                    </Typography>
                </Grid>
                <Grid item xs={12} >
                    <List sx={{ maxHeight: 500, overflow: "auto" }}>
                        {this.makeBulletPoints()}
                    </List>
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={4}>
                    <Button onClick={() => this.props.onClose()} >
                        Close
                    </Button>
                </Grid>
                <Grid item xs={4} />
            </Grid >
        );
    }

    private makeBulletPoints(): ReactElement[] {
        return [
            this.makeInfoBulletPoint(),
            this.makeOverviewBulletPoint(),
            this.makeStockBulletPoint(),
            this.makeFlowBulletPoint(),
            this.makeParamBulletPoint(),
            this.makeDynamicVariableBulletPoint(),
            this.makeSumVariableBulletPoint(),
            this.makeDeleteBulletPoint(),
            this.makeMoveBulletPoint(),
            this.makeEditBulletPoint(),
            this.makeConnectBulletPoint(),
            this.makeCloudBulletPoint(),
            this.makeIdentifyBulletPoint(),
            this.makeScenariosBulletPoint(),
            this.makeGetCodeBulletPoint(),
            this.makeGetDataBulletPoint(),
            this.makeRunModelBulletPoint(),
            this.makePublishModelBulletPoint(),
            this.makeImportModelBulletPoint(),
            this.makeGoBackBulletPoint(),
        ];
    }

    private makeBulletPoint(text: string, icon: ReactElement): ReactElement {
        return (
            <ListItem>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItem>
        );
    }

    private makeInfoBulletPoint(): ReactElement {
        const text = "Modelcollab is an open-source web-based application for multiple collaborators to create "
            + "system dynamics models simultaneously, and a backend which aims to provide rich options for running "
            + "the created models. Additionally, Modelcollab can be used to import from a library of existing models "
            + "which can then be quickly and easily extended. Modelcollab is currently in an early Alpha stage, is "
            + "missing many important planned features, and may contain bugs. Please report any bugs, unexpected "
            + "behaviours, or feature requests to eric.redekopp@usask.ca, or raise it as an issue in the git "
            + "repository at github.com/UofS-CEPHIL/modelcollab";
        const icon = (<InfoIcon />);
        return this.makeBulletPoint(text, icon);
    }

    private makeOverviewBulletPoint(): ReactElement {
        const text = "Models are composed of stocks, flows, dynamic variables, sum variables, parameters, and "
            + "connections between them. Additionally, a model may contain other models, referred to as inner models. "
            + "Inner models can be saved or imported using the 'import model' and 'save model' command on the toolbar. "
            + "Inner models may not be edited (except for their parameter values), but can be combined with other "
            + "models - including the outer model - by 'identifying' two components as being identical. Connections and "
            + "flows should only be drawn between components of the same model. To make a connection from the outer "
            + "model to an inner component, create a component of the same type in the outer model, connect it as "
            + "desired, then identify the outer and inner components. Equations should be written using the identifier "
            + "of any components used regardless of the component's type. E.g. the equation for the 'infection' flow "
            + "of a simple SIR model might be 'S*rInf*I/N' where S and I are stocks, rInf is a a parameter, and "
            + "N is a sum variable. Symbols are qualified by the backend using the connection arrows.";
        const icon = (<HelpOutlineIcon />);
        return this.makeBulletPoint(text, icon);
    }

    private makeStockBulletPoint(): ReactElement {
        const text = "Stock mode is used to create new stocks. Stocks are created by left-clicking on the "
            + "canvas. Edit the stock's starting value using Edit mode."
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.STOCK);
        return this.makeBulletPoint(text, icon);
    }

    private makeFlowBulletPoint(): ReactElement {
        const text = "Flow mode is used to create flows between existing stocks. Left click on the source stock, "
            + "then left click on the destination stock. Flow equations can be edited using Edit mode. Flows may "
            + "only be created between two stocks in the outer model. Flows have some known issues with rendering, "
            + "and may take unexpected paths to the destination stock. This can be remedied by moving the two stocks "
            + "in relation to each other, and may require some artistry to make it look good. This will be fixed "
            + "in a future update.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.FLOW);
        return this.makeBulletPoint(text, icon);
    }

    private makeParamBulletPoint(): ReactElement {
        const text = "Param mode is used to create a new parameter. A parameter represents a constant value. "
            + "Left click on the canvas to create a new parameter. Change the default value using Edit mode, "
            + "and override parameters by creating a new scenario. All models must contain a startTime and "
            + "stopTime parameter, which are populated automatically. If startTime or stopTime is found in an "
            + "inner model, it is disregarded.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.PARAM);
        return this.makeBulletPoint(text, icon);
    }

    private makeDynamicVariableBulletPoint(): ReactElement {
        const text = "Dynamic Variable mode creates a new dynamic variable. A dynamic variable represents a "
            + "computed value which may change throughout the model's execution. Left click on the canvas create a "
            + "new variable, then edit it using Edit mode. No components may depend on a "
            + "dynamic variable - that is, no flows, stocks, or other dynamic variables may use a dynamic variable "
            + "in their equation. This feature will be added in a future update.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.DYN_VARIABLE);
        return this.makeBulletPoint(text, icon);
    }

    private makeSumVariableBulletPoint(): ReactElement {
        const text = "Sum Variable mode creates a new sum variable. Like a dynamic variable, a sum variable "
            + "represents a computed dynamic value. However, a sum variable is specifically the sum of zero or "
            + "more stocks. Create a new sum variable by left clicking on the canvas, then mark the tallied stocks "
            + "by creating a connection from the stock to the sum variable. See 'Connect' for more.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.SUM_VARIABLE);
        return this.makeBulletPoint(text, icon);
    }

    private makeDeleteBulletPoint(): ReactElement {
        const text = "Delete mode deletes existing components. Left click on the component to be deleted. Only outer "
            + "components may be deleted, e.g. an inner model can be deleted but none of its components can. If "
            + "deletion causes any flows or connections to become orphaned, those components will also be deleted.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.DELETE);
        return this.makeBulletPoint(text, icon);
    }

    private makeMoveBulletPoint(): ReactElement {
        const text = "Move mode is for moving components and allows the selection and moving of multiple components by "
            + "left click and dragging. Nothing happens when components or the background are clicked.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.MOVE);
        return this.makeBulletPoint(text, icon);
    }

    private makeEditBulletPoint(): ReactElement {
        const text = "Edit mode allows users to edit existing components. Left click on the component to edit it. "
            + "A dialog box will appear and allow the component to be edited. Only outer components may be edited.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.EDIT);
        return this.makeBulletPoint(text, icon);
    }

    private makeConnectBulletPoint(): ReactElement {
        const text = "Connection mode creates connections between components. Connections may only be drawn between "
            + "components of the same model. Use Identify mode to represent inter-model connections. Left click and "
            + "drag the white squares to curve a connection arrow. Connections MUST be drawn from all depended "
            + "components to each component that depends on it. A 'depended component' is any component that appears "
            + "in a component's equation. E.g. in a typical SIR model, the flow from S=>I will depend on S, I, the "
            + "total population in the model, and possibly several parameters.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.CONNECT);
        return this.makeBulletPoint(text, icon);
    }

    private makeCloudBulletPoint(): ReactElement {
        const text = "Cloud mode creates a 'cloud' component. A cloud represents a stock whose value is always "
            + "infinite. This mode will be deleted in a future update, and instead a 'cloud' will automatically appear "
            + "for any flows with no source or destination.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.CLOUD);
        return this.makeBulletPoint(text, icon);
    }

    private makeIdentifyBulletPoint(): ReactElement {
        const text = "Identify mode is used to identify components of different models as being identical. Once an "
            + "identification is made, there is currently no way to delete it except directly via the database "
            + "(de-identification to be added in future update), so be careful. To identify components, click on one "
            + "of the identical components, then the other. The first one to be clicked will be the only one that is "
            + "rendered onscreen, i.e. all flows and connections previously going to the second clicked component "
            + "will be diverted to the first clicked component.";
        const icon = CanvasScreenToolbar.getIconForMode(UiMode.IDENTIFY);
        return this.makeBulletPoint(text, icon);
    }

    private makeScenariosBulletPoint(): ReactElement {
        const text = "Scenarios represent a set of parameter values. Use the scenarios edit box to create new "
            + "scenarios, edit or delete existing ones, and choose the scenario to be run when the 'run model' button "
            + "is clicked";
        const icon = CanvasScreenToolbar.getScenariosIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makeGetCodeBulletPoint(): ReactElement {
        const text = "The Get Code button allows the user to download the current model as Julia code, designed to "
            + "work with the package StockFlow.jl";
        const icon = CanvasScreenToolbar.getGetCodeIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makeGetDataBulletPoint(): ReactElement {
        const text = "The Get Data button allows the user to download the current model as JSON data. Currently, this "
            + "data can only be imported by directly modifying the database, but a future version will include the "
            + "ability to import model data from such JSON files.";
        const icon = CanvasScreenToolbar.getGetJsonIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makeRunModelBulletPoint(): ReactElement {
        const text = "The Run Model button allows the user to run the current scenario with ODE semantics. This will "
            + "be updated for other semantics in a future update. Model computation may take up to several minutes, "
            + "and is cancelled if the user navigates away from the page.";
        const icon = CanvasScreenToolbar.getDefaultComputeModelIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makePublishModelBulletPoint(): ReactElement {
        const text = "The Publish Model button allows the user to publish the current model to be imported into another "
            + "model. The behaviour is undefined for saving models which contain other models, and should not be done."
            + "A future update will allow such models to be saved in a 'flattened' form.";
        const icon = CanvasScreenToolbar.getPublishModelIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makeImportModelBulletPoint(): ReactElement {
        const text = "The Import Model button allows the user to import an existing model to be extended.";
        const icon = CanvasScreenToolbar.getImportModelIcon();
        return this.makeBulletPoint(text, icon);
    }

    private makeGoBackBulletPoint(): ReactElement {
        const text = "The Back button sends the user back to the session selection screen.";
        const icon = CanvasScreenToolbar.getGoBackIcon();
        return this.makeBulletPoint(text, icon);
    }
}
