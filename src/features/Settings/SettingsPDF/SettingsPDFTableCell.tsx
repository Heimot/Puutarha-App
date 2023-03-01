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
    addTableCell: (text: string) => void;
    deleteTableCell: (_id: string) => void;
    updateTableCell: (_id: string, value: string) => void;
}

const SettingsPDFTableCell: React.FC<Props> = ({ data, addTableCell, deleteTableCell, updateTableCell }) => {
    const [cell, setCell] = useState<string>('');
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>('');

    const theme = useTheme();

    return (
        <Box sx={{ marginBottom: '15px' }}>
            <Typography sx={{ marginTop: '5px' }} variant='h6'>Taulun solut</Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid xs={12} md={6}>
                    <Box sx={{ border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`, borderRadius: '5px' }}>
                        {data?.cells?.map((cell) => (
                            <Box key={cell._id} sx={{ display: 'flex', width: '100%', flexDirection: 'row', borderBottom: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`, padding: '5px', alignItems: 'center' }}>
                                <TextField fullWidth value={cell.text} onChange={(e: any) => updateTableCell(cell._id, e.target.value)} />
                                <Tooltip title='Poista'>
                                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => { setIsDeleteOpen(true); setSelected(cell._id); }}> <DeleteIcon fontSize='large' /></Button>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>
                </Grid>
                <Grid xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <TextField label={'Solu'} value={cell} onChange={(e: any) => setCell(e.target.value)} />
                        <Button onClick={() => addTableCell(cell)}>Lisää</Button>
                    </Box>
                </Grid>
            </Grid>
            <MenuDialog isOpen={isDeleteOpen} setIsOpen={(value: boolean) => setIsDeleteOpen(value)} result={() => deleteTableCell(selected)} dialogTitle={'Haluatko poistaa tämän solun PDF taulusta?'} actions={true}>
                {`Haluatko varmasti poistaa tämän solun PDF taulusta? Mikäli poistat sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Box >
    )
}

export default SettingsPDFTableCell;