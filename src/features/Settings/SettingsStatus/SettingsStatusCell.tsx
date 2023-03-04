import React, { useState, useEffect, useRef } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Box, Button, Switch, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SketchPicker } from 'react-color';

import { Status } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    cell: Status;
    select: Status[];
    saveCard: (cellId: string, state: string, nextState: string, bgcolor: string, color: string, isDefault: boolean) => void;
    deleteCard: (cellId: string) => void;
}

const SettingsStatusCell: React.FC<Props> = ({ cell, select, saveCard, deleteCard }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [state, setState] = useState<string>('');
    const [nextState, setNextState] = useState<string>('');
    const [bgcolor, setBGColor] = useState<string>('');
    const [color, setColor] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);

    const [bgIsOpen, setBGIsOpen] = useState<boolean>(false);
    const [colorIsOpen, setColorIsOpen] = useState<boolean>(false);

    const bgColorRef = useRef<any>(null);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setState(cell?.status);
        setBGColor(cell?.color);
        setColor(cell?.fontcolor);
        setIsDefault(cell?.default);
        if (typeof cell?.nextStatus === 'string') {
            setNextState(cell?.nextStatus)
        } else {
            if (cell?.nextStatus === '') {
                if (!cell?.nextStatus) return;
                setNextState(cell?.nextStatus)
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
                            <MenuItem key={value?._id} value={value?._id}>{value?.status}</MenuItem>
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
                                <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setBGIsOpen(!bgIsOpen)}>{cell?.status}</Button>
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
                                <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setColorIsOpen(!colorIsOpen)}>{cell?.status}</Button>
                                <SketchPicker color={color} onChange={(color) => setColor(color.hex)} />
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
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveCard(cell._id, state, nextState, bgcolor, color, isDefault)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteCard(cell._id)} dialogTitle={'Haluatko poistaa tämän tilauksen tilan?'} actions={true}>
                {`Haluatko varmasti poistaa tilauksen tilan ${cell?.status} (${cell?._id})? Mikäli poistat tilauksen tilan sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr >
    )
}

export default SettingsStatusCell;