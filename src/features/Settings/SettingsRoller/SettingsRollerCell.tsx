import React, { useState, useEffect, useRef } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Box, Button, Switch, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Roller } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { SketchPicker } from 'react-color';

interface Props {
    card: Roller;
    saveCard: (userId: string, roller: string, lockColor: string, isDefault: boolean) => void;
    deleteCard: (userId: string) => void;
}

const SettingsRollerCell: React.FC<Props> = ({ card, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [roller, setRoller] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [bgIsOpen, setBGIsOpen] = useState<boolean>(false);
    const [bgcolor, setBGColor] = useState<string>('#FFFFFF');

    const bgColorRef = useRef<any>(null);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setRoller(card?.roller);
        setBGColor(card?.lockColor);
        setIsDefault(card?.default);
    }, [card])

    useEffect(() => {
        const handleClick = (e: any) => {
            if (bgColorRef?.current && !bgColorRef?.current?.contains(e.target)) {
                setBGIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        }
    }, [])

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField fullWidth value={roller} onChange={(e) => setRoller(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>
                <Box sx={{ width: '100%', margin: '5px 0 5px 0' }}>
                    <Button fullWidth sx={{ bgcolor: bgcolor, color: 'black' }} onClick={() => setBGIsOpen(!bgIsOpen)}>Vaihda rullakon väri</Button>
                    {
                        bgIsOpen
                        &&
                        <Backdrop open={bgIsOpen} sx={{ zIndex: 2 }}>
                            <Box ref={bgColorRef}>
                                <Button sx={{ width: '100%', bgcolor: bgcolor, color: 'black' }} onClick={() => setBGIsOpen(!bgIsOpen)}>Vaihda rullakon väri</Button>
                                <SketchPicker color={bgcolor} onChange={(color) => setBGColor(color.hex)} />
                            </Box>
                        </Backdrop>
                    }
                </Box>
            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Switch
                        value={isDefault}
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(card._id, roller, bgcolor, isDefault)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(card._id)} dialogTitle={'Haluatko poistaa tämän rullakon?'} actions={true}>
                {`Haluatko varmasti poistaa rullakon ${card?.roller} (${card?._id})? Mikäli poistat rullakon sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsRollerCell;