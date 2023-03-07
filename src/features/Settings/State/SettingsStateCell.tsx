import React, { useState, useEffect, useRef } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Box, Button, Switch, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SketchPicker } from 'react-color';

import { State } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    cell: State;
    select: State[];
    saveCard: (cellId: string, state: string, nextState: string, bgcolor: string, color: string, isDefault: boolean, sticker: boolean) => void;
    deleteCard: (cellId: string) => void;
}

const SettingsStateCell: React.FC<Props> = ({ cell, select, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [state, setState] = useState<string>('');
    const [nextState, setNextState] = useState<string>('');
    const [bgcolor, setBGColor] = useState<string>('');
    const [color, setColor] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [sticker, setSticker] = useState<boolean>(false);

    const [bgIsOpen, setBGIsOpen] = useState<boolean>(false);
    const [colorIsOpen, setColorIsOpen] = useState<boolean>(false);

    const bgColorRef = useRef<any>(null);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setState(cell?.state);
        setBGColor(cell?.color);
        setColor(cell?.fontcolor);
        setIsDefault(cell?.default);
        setSticker(cell?.stickerPoint);
        if (typeof cell?.nextState === 'string') {
            setNextState(cell?.nextState)
        } else {
            if (cell?.nextState === '') {
                if (!cell?.nextState) return;
                setNextState(cell?.nextState)
            }
        }
    }, [cell])

    useEffect(() => {
        const handleClick = (e: any) => {
            if (bgColorRef?.current && !bgColorRef?.current?.contains(e.target)) {
                setBGIsOpen(false);
                setColorIsOpen(false);
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
                <TextField fullWidth value={state} onChange={(e) => setState(e.target.value)}></TextField>
            </Td>
            <Td style={borderStyle}>

                <Select value={nextState} onChange={(e: any) => setNextState(e.target.value)} fullWidth>
                    {
                        select?.map((value) => (
                            <MenuItem key={value?._id} value={value?._id}>{value?.state}</MenuItem>
                        ))
                    }
                </Select>

            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Button fullWidth sx={{ bgcolor: bgcolor, color: color }} onClick={() => setBGIsOpen(!bgIsOpen)}>Vaihda taustaväriä</Button>
                    {
                        bgIsOpen
                        &&
                        <Backdrop open={bgIsOpen} sx={{ zIndex: 2 }}>
                            <Box ref={bgColorRef}>
                                <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setBGIsOpen(!bgIsOpen)}>{cell?.state}</Button>
                                <SketchPicker color={bgcolor} onChange={(color) => setBGColor(color.hex)} />
                            </Box>
                        </Backdrop>
                    }
                </Box>
            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Button fullWidth sx={{ bgcolor: bgcolor, color: color }} onClick={() => setColorIsOpen(!colorIsOpen)}>Vaihda tekstinväriä</Button>
                    {
                        colorIsOpen
                        &&
                        <Backdrop open={colorIsOpen} sx={{ zIndex: 2 }}>
                            <Box ref={bgColorRef}>
                                <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setColorIsOpen(!colorIsOpen)}>{cell?.state}</Button>
                                <SketchPicker color={color} onChange={(color) => setColor(color.hex)} />
                            </Box>
                        </Backdrop>
                    }
                </Box>
            </Td>
            <Td style={borderStyle}>
                <Switch
                    value={isDefault}
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                />
            </Td>
            <Td style={borderStyle}>
                <Box>
                    <Switch
                        value={sticker}
                        checked={sticker}
                        onChange={(e) => setSticker(e.target.checked)}
                    />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(cell._id, state, nextState, bgcolor, color, isDefault, sticker)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(cell._id)} dialogTitle={'Haluatko poistaa tämän tuotteen tilan?'} actions={true}>
                {`Haluatko varmasti poistaa tuotteen tilan ${cell?.state} (${cell?._id})? Mikäli poistat tuotteen tilan sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsStateCell;