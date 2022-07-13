import Modal from '@mui/material/Modal';
import React, { FC, useState } from 'react';
import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent, ComponentType } from '../../data/FirebaseComponentModel';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';

export interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    component: FirebaseDataComponent;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}

const EditBox: FC<Props> = (props) => {

    const [sharedState, setSharedState] = useState<FirebaseDataComponent>();
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

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.component.getId(), (data: FirebaseDataComponent) => {
            if ((!sharedState?.equals(data) && data.getType() === ComponentType.STOCK)){                   

                setSharedState(data as StockFirebaseComponent);
            }
            else if ((!sharedState?.equals(data) && data.getType() === ComponentType.FLOW)){

                setSharedState(data as FlowFirebaseComponent);
            }
        });

    
    const handleClose = () => {
        props.setOpen(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {

        if (sharedState?.getType() === ComponentType.STOCK){
            const newData = {...sharedState.getData(), [event.target.name]: event.target.value};
            const newState: StockFirebaseComponent = (sharedState as StockFirebaseComponent).withData(newData);
            props.firebaseDataModel.updateComponent(props.sessionId, newState);
        }
        else if (sharedState?.getType() === ComponentType.FLOW){
            const newData = {...sharedState.getData(), [event.target.name]: event.target.value};
            const newState: FlowFirebaseComponent = (sharedState as FlowFirebaseComponent).withData(newData);
            props.firebaseDataModel.updateComponent(props.sessionId, newState);
        }
    };

    return (
        <div
            data-testid="editBox-div"
        >
            <Modal
                data-testid="editBox-Modal"
                open={props.open}
            > 
            {(sharedState?.getType() === ComponentType.STOCK)
                ?<Box
                    data-testid="editBox-Box"
                    sx={style}>
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
                     <Button variant="contained" onClick={handleClose}>Close</Button>
                </Box>

                :<Box 
                    data-testid="editBox-Box"
                    sx={style}>
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
                    <Button variant="contained" onClick={handleClose}>Close</Button>
                </Box>}
            </Modal>
    
                
        </div>

    );
}

export default EditBox;
