import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Box, Button, Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Location } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    card: Location;
    select: Location[];
    saveCard: (userId: string, location: string, nextLocation: string, isDefault: boolean) => void;
    deleteCard: (userId: string) => void;
}

const SettingsLocationCell: React.FC<Props> = ({ card, select, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [location, setLocation] = useState<string>('');
    const [nextLocation, setNextLocation] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setLocation(card?.location);

        setIsDefault(card?.default);
        if (typeof card?.nextLocation === 'string') {
            setNextLocation(card?.nextLocation);
        } else {
            if (card?.nextLocation === '') {
                if (!card?.nextLocation) return;
                setNextLocation(card?.nextLocation);
            }
        }
    }, [card])

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField fullWidth value={location} onChange={(e) => setLocation(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <Select value={nextLocation} onChange={(e) => setNextLocation(e.target.value)} fullWidth>
                    {
                        select.map((loc) => (
                            <MenuItem key={loc._id} value={loc._id}>{loc.location}</MenuItem>
                        ))
                    }
                </Select>
            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Switch
                        value={isDefault}
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(card._id, location, nextLocation, isDefault)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(card._id)} dialogTitle={'Haluatko poistaa tämän sijainnin?'} actions={true}>
                {`Haluatko varmasti poistaa sijainnin ${card?.location} (${card?._id})? Mikäli poistat sijainnin sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsLocationCell