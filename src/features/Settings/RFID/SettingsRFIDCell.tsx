import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card, User } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    card: Card;
    users: User[];
    saveCard: (userId: string, roleId: string, card: string, cNumber: string) => void;
    deleteCard: (userId: string) => void;
}

const SettingsRFIDCell: React.FC<Props> = ({ card, users, saveCard, deleteCard }) => {
    const [user, setUser] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [cNumber, setCNumber] = useState<string>('');

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setName(card?.cardOwner);
        setCNumber(card?.cardNumber);
        if (typeof card?.cardAccount === 'string') {
            setUser(card?.cardAccount)
        } else {
            if (card?.cardAccount === '') {
                if (!card?.cardAccount) return;
                setUser(card?.cardAccount)
            }
        }
    }, [card])

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <TextField fullWidth value={cNumber} onChange={(e) => setCNumber(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <Select value={user} onChange={(e: any) => setUser(e.target.value)} fullWidth>
                        {
                            users.map((user) => (
                                <MenuItem key={user?._id} value={user?._id}>{user?.username}</MenuItem>
                            ))
                        }
                    </Select>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(card._id, user, name, cNumber)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(card._id)} dialogTitle={'Haluatko poistaa tämän kortin?'} actions={true}>
                {`Haluatko varmasti poistaa käyttäjän ${card?.cardOwner} kortin ${card?.cardNumber}? Mikäli poistat kortin sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsRFIDCell