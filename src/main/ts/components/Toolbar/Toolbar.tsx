import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface Props {
    mode: string
    setMode: React.Dispatch<React.SetStateAction<string>>
}


export default function Toolbar( props : Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    switch (newValue){
      case 0:
        props.setMode("Move");
        break;
      case 1:
        props.setMode("Create");
        break;
      case 2:
        props.setMode("Delete");
        break;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Move"/>
          <Tab label="Create"/>
          <Tab label="Delete"/>
        </Tabs>
      </Box>
    </Box>
  );
}
