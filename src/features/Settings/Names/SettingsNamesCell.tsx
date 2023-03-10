import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Flower, Store } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    card: Store | Flower;
    saveCard: (userId: string, card: string, group: string) => void;
    deleteCard: (userId: string) => void;
}

const SettingsNamesCell: React.FC<Props> = ({ card, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [group, setGroup] = useState<string>('');

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setName(card?.name);
        setGroup(card?.group);
    }, [card])

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <Select value={group} onChange={(e) => setGroup(e.target.value)} fullWidth>
                        <MenuItem value='Flowers'>Kukka</MenuItem>
                        <MenuItem value='Stores'>Kauppa</MenuItem>
                    </Select>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(card._id, name, group)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(card._id)} dialogTitle={'Haluatko poistaa t??m??n nimen?'} actions={true}>
                {`Haluatko varmasti poistaa nimen ${card?.name} ryhm??st?? ${card?.group}? Mik??li poistat nimen sit?? ei voida en???? palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsNamesCell;