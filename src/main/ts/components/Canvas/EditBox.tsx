

import Modal from '@mui/material/Modal';
import React, { FC, useState } from 'react';
import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent, ComponentType } from '../../data/FirebaseComponentModel';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, FormControl, Input, InputLabel, TextField } from '@mui/material';

export interface Props {
    setSelectedEdit: React.Dispatch<React.SetStateAction<string | null>>
    componentId: string;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}

const EditBox: FC<Props> = (props) => {

    let saved: any;
    const [sharedState, setSharedState] = useState<FirebaseDataComponent | null>(null);

    const [open, setOpen] = useState<boolean>(true);

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

    
    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, (data: FirebaseDataComponent) => {
            if ( sharedState === null || (!sharedState.equals(data) && data.getType() === ComponentType.STOCK)){   
                saved =  data as StockFirebaseComponent
                setSharedState(data as StockFirebaseComponent);
                console.log("executed",data)
            }
            else if ( sharedState === null || (!sharedState.equals(data) && data.getType() === ComponentType.FLOW)){
                saved = data as FlowFirebaseComponent
                setSharedState(data as FlowFirebaseComponent);
            }
        });

    
    const handleClose = () => {

        setOpen(false)
        props.setSelectedEdit(null)

    }

    const submitChange = () => {
        if (sharedState){
            props.firebaseDataModel.updateComponent(props.sessionId, sharedState);
        }    
        handleClose()
    }
    const discardChange = () =>{
        setSharedState(saved)
        handleClose()
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {

        if (sharedState?.getType() === ComponentType.STOCK){
            const newData = {...sharedState.getData(), [event.target.name]: event.target.value }
            const newState: StockFirebaseComponent = (sharedState as StockFirebaseComponent).withData(newData) ;
            setSharedState(newState);
        }
        else if ( sharedState?.getType() === ComponentType.FLOW){
            const newData = {...sharedState.getData(), [event.target.name]: event.target.value }
            const newState: FlowFirebaseComponent = (sharedState as FlowFirebaseComponent).withData(newData) ;
            setSharedState(newState);
        }

    };

    return (
        <div>
             <Modal
                open={open}
                onClose={handleClose}
            > 
            {(sharedState && sharedState.getType() === ComponentType.STOCK)
                ?<Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Edit Stock
                    </Typography>
                    <TextField id="outlined-basic"
                        value={sharedState.getData().initvalue}
                        onChange={handleChange}
                        name="initvalue"
                        inputProps={{
                            className: "Mui_Stock",
                            id: props.componentId,
                            "data-testid": "stock-textfield-mui"
                        }}
                    />
                     <Button variant="contained" onClick={submitChange}>Save</Button>
                     <Button variant="contained" onClick={discardChange}>Cancel</Button>
                </Box>

                :<Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Edit Flow
                    </Typography>
                    <FormControl>
                        <InputLabel htmlFor="component-simple">
                            Depends on     
                        </InputLabel>
                        <Input id="component-simple" 
                            name="dependsOn"
                            value={sharedState?.getData().dependsOn}
                            onChange={handleChange} 
                        />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="component-simple">
                            Equation     
                        </InputLabel>
                        <Input id="component-simple" 
                            name="equation"
                            value={sharedState?.getData().equation} 
                            onChange={handleChange} 
                        />
                    </FormControl>
                    <Button>
                        //save button
                    </Button>
                </Box>}
            </Modal>
    
                
        </div>

    );
}

export default EditBox;
