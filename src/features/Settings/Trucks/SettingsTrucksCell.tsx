import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Box, Button, Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Truck } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    card: Truck;
    saveCard: (userId: string, truck: string, isDefault: boolean) => void;
    deleteCard: (userId: string) => void;
}

const SettingsTrucksCell: React.FC<Props> = ({ card, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [truck, setTruck] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setTruck(card?.truckLicensePlate);

        setIsDefault(card?.default);
    }, [card])

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField fullWidth value={truck} onChange={(e) => setTruck(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Switch
                        value={isDefault}
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(card._id, truck, isDefault)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(card._id)} dialogTitle={'Haluatko poistaa tämän rekan?'} actions={true}>
                {`Haluatko varmasti poistaa rekan ${card?.truckLicensePlate} (${card?._id})? Mikäli poistat rekan sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsTrucksCell;