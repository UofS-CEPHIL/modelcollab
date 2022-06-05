import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export interface Props {
    mode: string
    setMode: React.Dispatch<React.SetStateAction<string>>
}


export default function Toolbar( props : Props) {
  const [value, setValue] = React.useState(0);

  // This is the modifie handleChange used in Tabs. We can delete this once we know we dont need it
  // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setValue(newValue);

  //   if ((event.target as Element).textContent){
  //       props.setMode(`${(event.target as Element).textContent}`) 
  //   }
  // };


  const handleChange: React.MouseEventHandler = (event: React.MouseEvent) => {

    if ( `${(event.target as Element).textContent}` === "Move")
      setValue(0);
    else if ( `${(event.target as Element).textContent}` === "Create")
      setValue(1);
    else
      setValue(2)
    
    props.setMode(`${(event.target as Element).textContent}`)
  }

  return (
    <Box sx={{ width: '100%' }} data-testid = 'toolbar-box'>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} aria-label="basic tabs example" data-testid = 'toolbar-tabs'>
          <Tab label="Move" value = {0} onClick = {handleChange}/>
          <Tab label="Create" value = {1} onClick = {handleChange}/>
          <Tab label="Delete" value = {2} onClick = {handleChange}/>
        </Tabs>
      </Box>
    </Box>
  );
}
