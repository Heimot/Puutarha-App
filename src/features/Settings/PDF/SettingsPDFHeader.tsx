import React, { useState } from 'react'
import { Box, Typography, Button } from '@mui/material';
import Message from '../../Components/Message';
import { PDFHeader } from '../../../Model';

interface Props {
    data: PDFHeader | undefined;
    createHeader: () => void;
    deleteHeader: (_id: string) => void;
}

const SettingsPDFHeader: React.FC<Props> = ({ data, createHeader, deleteHeader }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
            <Typography variant='h6'>Ylätunniste</Typography>
            {!data
                &&
                <Button onClick={() => { setIsOpen(true); createHeader(); }}>Lisää ylätunniste</Button>
            }
            {data
                &&
                <Button onClick={() => { setIsDeleteOpen(true); deleteHeader(data._id); }} color='error'>Poista ylätunniste</Button>
            }
            {
                isOpen
                &&
                <Message setIsOpen={(value) => setIsOpen(value)} isOpen={isOpen} dialogTitle={'PDF taulu'}>
                    PDF ylätunniste on lisätty onnistuneesti.
                </Message>
            }
            {
                isDeleteOpen
                &&
                <Message setIsOpen={(value) => setIsDeleteOpen(value)} isOpen={isDeleteOpen} dialogTitle={'PDF taulu'}>
                    PDF ylätunniste on poistettu onnistuneesti.
                </Message>
            }
        </Box >
    )
}

export default SettingsPDFHeader;