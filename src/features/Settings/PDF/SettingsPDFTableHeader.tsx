import React, { useState } from 'react';
import { TextField, Button, Box, Tooltip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useTheme } from '@mui/material/styles';
import { PDFTable } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';



interface Props {
  data: PDFTable | undefined;
  addTableHeader: (text: string) => void;
  deleteTableHeader: (_id: string) => void;
  updateTableHeader: (_id: string, value: string) => void;
}

const SettingsPDFTableHeader: React.FC<Props> = ({ data, addTableHeader, deleteTableHeader, updateTableHeader }) => {
  const [header, setHeader] = useState<string>('');
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedHeader, setSelectedHeader] = useState<string>('');

  const theme = useTheme();

  return (
    <Box sx={{ marginBottom: '15px' }}>
      <Typography variant='h6'>Taulun otsikot</Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid xs={12} md={6}>
          <Box sx={{ border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`, borderRadius: '5px' }}>
            {data?.headers?.map((header) => (
              <Box key={header._id} sx={{ display: 'flex', width: '100%', flexDirection: 'row', borderBottom: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`, padding: '5px', alignItems: 'center' }}>
                <TextField fullWidth value={header.text} onChange={(e: any) => updateTableHeader(header._id, e.target.value)} />
                <Tooltip title='Poista'>
                  <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => { setIsDeleteOpen(true); setSelectedHeader(header._id); }}> <DeleteIcon fontSize='large' /></Button>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField label={'Otsikko'} value={header} onChange={(e: any) => setHeader(e.target.value)} />
            <Button onClick={() => addTableHeader(header)}>Lisää</Button>
          </Box>
        </Grid>
      </Grid>
      <MenuDialog isOpen={isDeleteOpen} setIsOpen={(value: boolean) => setIsDeleteOpen(value)} result={() => deleteTableHeader(selectedHeader)} dialogTitle={'Haluatko poistaa tämän otsikon PDF taulusta?'} actions={true}>
        {`Haluatko varmasti poistaa tämän otsikon PDF taulusta? Mikäli poistat sitä ei voida enää palauttaa.`}
      </MenuDialog>
    </Box >
  )
}

export default SettingsPDFTableHeader;