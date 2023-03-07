import React, { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material';
import Message from '../../Components/Message';
import { PDFTable } from '../../../Model';

interface Props {
    data: PDFTable | undefined;
    createTable: (yPosition: number) => void;
    deleteTable: (_id: string) => void;
    updateTable: (value: number) => void;
}

const SettingsPDFTableData: React.FC<Props> = ({ createTable, data, deleteTable, updateTable }) => {
    const [yPos, setYPos] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!data) return;
        setYPos(data?.yPosition);
    }, [])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
            <Typography variant='h6'>Taulujen lisääminen</Typography>
            {!data
                &&
                <Button onClick={() => { setIsOpen(true); createTable(0); }}>Lisää taulu</Button>
            }
            {data
                &&
                <Box sx={{ display: 'flex', flexDirection: 'column' }} >
                    <TextField type='number' label='Y-Kohta' value={yPos} onChange={(e: any) => { updateTable(e.target.value); setYPos(Number(e.target.value)); }} />
                    <Button onClick={() => { setIsDeleteOpen(true); deleteTable(data._id); }} color='error'>Poista taulu</Button>
                </Box>
            }
            {
                isOpen
                &&
                <Message setIsOpen={(value) => setIsOpen(value)} isOpen={isOpen} dialogTitle={'PDF taulu'}>
                    PDF taulu on lisätty onnistuneesti.
                </Message>
            }
            {
                isDeleteOpen
                &&
                <Message setIsOpen={(value) => setIsDeleteOpen(value)} isOpen={isDeleteOpen} dialogTitle={'PDF taulu'}>
                    PDF taulu on poistettu onnistuneesti.
                </Message>
            }
        </Box >
    )
}

export default SettingsPDFTableData;