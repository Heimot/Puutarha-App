import React, { useRef, useState, useEffect } from 'react'
import { TextField, Button, Typography, FormControlLabel, Switch, Box, Backdrop } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsRollerTable from './SettingsRollerTable';
import Paper from '@mui/material/Paper';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Roller, Message as ModelMessage } from '../../../Model';
import Message from '../../Components/Message';
import { SketchPicker } from 'react-color';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsRoller = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [bgIsOpen, setBGIsOpen] = useState<boolean>(false);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [roller, setRoller] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [bgcolor, setBGColor] = useState<string>('#FFFFFF');
    const [createdTruck, setCreatedTruck] = useState<Roller | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

    const bgColorRef = useRef<any>(null);

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

    const addRoller = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            roller: roller,
            lockColor: bgcolor,
            default: isDefault
        }

        const cTruck = await FetchData({ urlHost: url, urlPath: '/rollers/create_roller', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setCreatedTruck(cTruck.result);
        if (cTruck?.result) {
            setMessage({ title: 'Rullakko lisätty.', message: 'Rullakko on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (cTruck?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko rullakko jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px', alignItems: 'center' }}>
                        <Typography>
                            Lisää rullakkoja
                        </Typography>
                        <TextField value={roller} onChange={(e) => setRoller(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Rullakko' />
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
                        <FormControlLabel
                            control={
                                <Switch
                                    value={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                            }
                            label='Alkuperäinen'
                        />
                        <Button color='primary' onClick={() => addRoller()}>Tallenna</Button>
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
                            {isOpen ? 'Piilota rullakko' : 'Näytä rullakko'}
                            {
                                isOpen
                                    ?
                                    <SettingsRollerTable newCard={createdTruck} />
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

export default SettingsRoller;