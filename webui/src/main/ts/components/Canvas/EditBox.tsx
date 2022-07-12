import Modal from '@mui/material/Modal';
import React, { FC, useState } from 'react';
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from '../../data/FirebaseDataModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';

export interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    component: schema.FirebaseDataComponent;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}

const EditBox: FC<Props> = (props) => {

    const [sharedState, setSharedState] = useState<schema.FirebaseDataComponent | null>();
    // const [savedSharedState, setSavedSharedState] = useState<FirebaseDataComponent | null>(null);

    let savedSharedState: schema.FirebaseDataComponent | null = null;
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    // console.log("render",savedSharedState);

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.component.getId(), (data: schema.FirebaseDataComponent) => {
        if ((!sharedState?.equals(data) && data.getType() === schema.ComponentType.STOCK)) {
            if (savedSharedState == null) {
                // setSavedSharedState(data as StockFirebaseComponent)
                savedSharedState = (data as schema.StockFirebaseComponent);
            }
            setSharedState(data as schema.StockFirebaseComponent);
        }
        else if ((!sharedState?.equals(data) && data.getType() === schema.ComponentType.FLOW)) {
            if (savedSharedState == null) {
                savedSharedState = (data as schema.FlowFirebaseComponent);
            }
            setSharedState(data as schema.FlowFirebaseComponent);
        }
    });


    const handleClose = () => {
        props.setOpen(false);
    }

    // const submitChange = () => {
    //     if (sharedState){
    //         console.log("submit",sharedState);
    //         savedSharedState = sharedState;
    //         // props.firebaseDataModel.updateComponent(props.sessionId, sharedState);
    //     }    
    //     handleClose()
    // }
    // const discardChange = () =>{
    //     if (savedSharedState){
    //         console.log("discard",savedSharedState)
    //         props.firebaseDataModel.updateComponent(props.sessionId, savedSharedState);
    //     }
    //     handleClose()
    // }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {

        if (sharedState?.getType() === schema.ComponentType.STOCK) {
            const newData = { ...sharedState.getData(), [event.target.name]: event.target.value };
            const newState: schema.StockFirebaseComponent = (sharedState as schema.StockFirebaseComponent).withData(newData);
            props.firebaseDataModel.updateComponent(props.sessionId, newState);
        }
        else if (sharedState?.getType() === schema.ComponentType.FLOW) {
            const newData = { ...sharedState.getData(), [event.target.name]: event.target.value };
            const newState: schema.FlowFirebaseComponent = (sharedState as schema.FlowFirebaseComponent).withData(newData);
            props.firebaseDataModel.updateComponent(props.sessionId, newState);
        }
    };

    return (
        <div>
            <Modal
                open={props.open}
            >
                {(sharedState?.getType() === schema.ComponentType.STOCK)
                    ? <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Edit Stock
                        </Typography>

                        <TextField id="outlined-basic"
                            value={sharedState.getData().initvalue}
                            onChange={handleChange}
                            name="initvalue"
                            label="Initial Value"
                            inputProps={{
                                className: "Mui_Stock",
                                id: props.component.getId(),
                                "data-testid": "stock-textfield-mui"
                            }}
                        />

                        {/* <Button variant="contained" onClick={submitChange}>Save</Button>
                     <Button variant="contained" onClick={discardChange}>Cancel</Button> */}
                        <Button variant="contained" onClick={handleClose}>Close</Button>
                    </Box>

                    : <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Edit Flow
                        </Typography>

                        <TextField id="outlined-basic"
                            value={sharedState?.getData().dependsOn}
                            onChange={handleChange}
                            name="dependsOn"
                            label="Depends on"
                            inputProps={{
                                className: "Mui_Stock",
                                id: props.component.getId(),
                                "data-testid": "stock-textfield-mui"
                            }}
                        />
                        <TextField id="outlined-basic"
                            value={sharedState?.getData().equation}
                            onChange={handleChange}
                            name="equation"
                            label="Equation"
                            inputProps={{
                                className: "Mui_Stock",
                                id: props.component.getId(),
                                "data-testid": "stock-textfield-mui"
                            }}
                        />

                        {/* <Button>
                        //save button
                    </Button> */}
                        <Button variant="contained" onClick={handleClose}>Close</Button>
                    </Box>}
            </Modal>


        </div>

    );
}

export default EditBox;