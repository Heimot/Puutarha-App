import React, { useState } from 'react'
import { Button, Typography, TextField, Box } from '@mui/material';
import { Tr, Td } from 'react-super-responsive-table'
import DeleteIcon from '@mui/icons-material/Delete';
import { Stickers } from '../MainMenu/Model'
import { useTheme } from '@mui/material/styles';

interface Props {
    sticker: Stickers;
    deleteSticker: (id: string) => void;
    addStickers: (sticker: Stickers, amount: Number) => void;
}

const PrinterData: React.FC<Props> = ({ sticker, deleteSticker, addStickers }) => {
    const [amount, setAmount] = useState(1);
    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }
    return (
        <Tr style={{ textAlign: 'center' }}>
            <Td style={borderStyle}>
                <Typography>{sticker.store.name}</Typography>
            </Td>
            <Td style={borderStyle}>
                <Typography>{sticker.flower.name}</Typography>
            </Td>
            <Td style={borderStyle}>
                <Typography>{sticker.amount}</Typography>
            </Td>
            <Td style={borderStyle}>
                <Typography>{sticker.information}</Typography>
            </Td>
            <Td style={borderStyle}>
      
                  
                        <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                            <TextField inputProps={{ style: { textAlign: 'center' } }} name='information' fullWidth value={amount} onChange={(e) => { setAmount(Number(e.target.value)); addStickers(sticker, Number(e.target.value)); }} />
                            <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => deleteSticker(sticker._id)} >
                                <DeleteIcon fontSize='large' />
                            </Button>
                        </Box>
                  
               
            </Td>
        </Tr>
    )
}

export default PrinterData