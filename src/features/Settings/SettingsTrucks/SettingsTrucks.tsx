import React, { useState } from 'react'
import { TextField, Button, Typography, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsTrucksTable from './SettingsTrucksTable';
import Paper from '@mui/material/Paper';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Truck, Message as ModelMessage } from '../../../Model';
import Message from '../../Components/Message';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsTrucks = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [truck, setTruck] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [createdTruck, setCreatedTruck] = useState<Truck | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

    const addTruck = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            truckLicensePlate: truck,
            default: isDefault
        }

        const cTruck = await FetchData({ urlHost: url, urlPath: '/trucks/create_truck', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setCreatedTruck(cTruck.result);
        if (cTruck?.result) {
            setMessage({ title: 'Rekka lisätty.', message: 'Rekka on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (cTruck?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko rekka jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px', alignItems: 'center' }}>
                        <Typography>
                            Lisää rekkoja
                        </Typography>
                        <TextField value={truck} onChange={(e) => setTruck(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Rekka' />
                        <FormControlLabel
                            control={
                                <Switch
                                    value={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                            }
                            label='Alkuperäinen'
                        />
                        <Button color='primary' onClick={() => addTruck()}>Tallenna</Button>
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
                            {isOpen ? 'Piilota rekat' : 'Näytä rekat'}
                            {
                                isOpen
                                    ?
                                    <SettingsTrucksTable newCard={createdTruck} />
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

export default SettingsTrucks;