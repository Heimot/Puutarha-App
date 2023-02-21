import React, { useState, useEffect, useRef } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Switch, Box, Backdrop } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsStateTable from './SettingsStateTable';
import Paper from '@mui/material/Paper';
import { SketchPicker } from 'react-color';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Message as ModelMessage, State } from '../../../Model';
import Message from '../../Components/Message';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsState = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [select, setSelect] = useState<State[]>([]);
    const [state, setState] = useState<string>('');
    const [nextState, setNextState] = useState<string>('');
    const [bgcolor, setBGColor] = useState<string>('#FFFFFF');
    const [color, setColor] = useState<string>('#000000');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [sticker, setSticker] = useState<boolean>(false);
    const [settings, setSettings] = useState<State | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });
    const [bgIsOpen, setBGIsOpen] = useState<boolean>(false);
    const [colorIsOpen, setColorIsOpen] = useState<boolean>(false);

    const bgColorRef = useRef<any>(null);

    useEffect(() => {
        const handleClick = (e: any) => {
            if (bgColorRef?.current && !bgColorRef?.current?.contains(e.target)) {
                setBGIsOpen(false);
                setColorIsOpen(false);
            }
        }

        const getSelect = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/state/get_states', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setSelect(fetchRoles.result)
        }

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        getSelect();
        return () => {
            setSelect([]);
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        }
    }, [])

    const addRFID = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let nState = undefined;
        if (nextState !== '') {
            nState = nextState;
        }
        let body = {
            currentUserId: userId,
            state: state,
            nextState: nState,
            color: bgcolor,
            fontcolor: color,
            default: isDefault,
            stickerPoint: sticker
        }

        const settingsData = await FetchData({ urlHost: url, urlPath: '/state/create_state', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setSettings(settingsData.result);
        if (settingsData?.result) {
            setMessage({ title: 'Tuotteen tila lisätty.', message: 'Tuotteen tila on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (settingsData?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko tila jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px', alignItems: 'center' }}>
                        <Typography>
                            Lisää tuotteen tiloja
                        </Typography>
                        <TextField value={state} onChange={(e) => setState(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Tila' />
                        <FormControl sx={{ margin: '5px 0 5px 0' }} fullWidth>
                            <InputLabel id='TILA_ID'>Seuraava tila</InputLabel>
                            <Select value={nextState} onChange={(e) => setNextState(e.target.value)} labelId='TILA_ID' label='Seuraava tila'>
                                <MenuItem value=''>Tyhjä</MenuItem>
                                {
                                    select?.map((nextState) => (
                                        <MenuItem key={nextState._id} value={nextState._id}>{nextState.state}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <Box sx={{ width: '100%', margin: '5px 0 5px 0' }}>
                            <Button fullWidth sx={{ bgcolor: bgcolor, color: color }} onClick={() => setBGIsOpen(!bgIsOpen)}>Vaihda taustaväri</Button>
                            {
                                bgIsOpen
                                &&
                                <Backdrop open={bgIsOpen} sx={{ zIndex: 2 }}>
                                    <Box ref={bgColorRef}>
                                        <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setBGIsOpen(!bgIsOpen)}>Vaihda taustaväri</Button>
                                        <SketchPicker color={bgcolor} onChange={(color) => setBGColor(color.hex)} />
                                    </Box>
                                </Backdrop>
                            }
                        </Box>
                        <Box sx={{ width: '100%', margin: '10px 0 5px 0' }}>
                            <Button fullWidth sx={{ bgcolor: bgcolor, color: color }} onClick={() => setColorIsOpen(!colorIsOpen)}>Vaihda tekstinväriä</Button>
                            {
                                colorIsOpen
                                &&
                                <Backdrop open={colorIsOpen} sx={{ zIndex: 2 }}>
                                    <Box ref={bgColorRef}>
                                        <Button sx={{ width: '100%', bgcolor: bgcolor, color: color }} onClick={() => setColorIsOpen(!colorIsOpen)}>Vaihda tekstinväriä</Button>
                                        <SketchPicker color={color} onChange={(color) => setColor(color.hex)} />
                                    </Box>
                                </Backdrop>
                            }
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    value={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                            }
                            label='Alkuperäinen'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    value={sticker}
                                    onChange={(e) => setSticker(e.target.checked)}
                                />
                            }
                            label='Tarrantulostus'
                        />
                        <Typography sx={{ fontSize: '10px' }}></Typography>
                        <Button color='primary' onClick={() => addRFID()}>Tallenna</Button>
                    </Grid>
                    <Grid sx={{ width: '100%' }}>
                        <Item>
                            <KeyboardArrowDown
                                onClick={() => setIsOpen(!isOpen)}
                                sx={{
                                    mr: -1,
                                    transform: isOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                    transition: '0.2s',
                                }}
                            />
                            {isOpen ? 'Piilota tilat' : 'Näytä tilat'}
                            {
                                isOpen
                                    ?
                                    <SettingsStateTable newCard={settings} />
                                    :
                                    null
                            }
                        </Item>
                    </Grid>
                </Item>
            </Grid>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle={message.title}>
                        {message.message}
                    </Message>
                    :
                    null
            }
        </Grid>
    )
}

export default SettingsState;