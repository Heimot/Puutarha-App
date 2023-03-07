import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsLocationTable from './SettingsLocationTable';
import Paper from '@mui/material/Paper';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Location, Message as ModelMessage } from '../../../Model';
import Message from '../../Components/Message';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsLocation = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [location, setLocation] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [nextLocation, setNextLocation] = useState<string>('');
    const [createdLocation, setCreatedLocation] = useState<Location | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

    useEffect(() => {
        const getUsers = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/location/get_locations', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setLocations(fetchRoles.result)
        }
        getUsers();

        return () => {
            setLocations([]);
        }
    }, [])

    const addLocation = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let nextLoc = null;
        if (nextLocation !== '') nextLoc = nextLocation;
        let body = {
            currentUserId: userId,
            location: location,
            nextLocation: nextLoc,
            default: isDefault
        }

        const createRFID = await FetchData({ urlHost: url, urlPath: '/location/create_location', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setCreatedLocation(createRFID.result);
        if (createRFID?.result) {
            setMessage({ title: 'Sijainti lisätty.', message: 'Sijainti on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (createRFID?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko sijainti jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px', alignItems: 'center' }}>
                        <Typography>
                            Lisää keräyspaikkoja
                        </Typography>
                        <TextField value={location} onChange={(e) => setLocation(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Sijainti' />
                        <FormControl fullWidth sx={{ margin: '5px 0 5px 0' }}>
                            <InputLabel id='LOCATION_ID'>Seuraava sijainti</InputLabel>
                            <Select value={nextLocation} onChange={(e) => setNextLocation(e.target.value)} labelId='LOCATION_ID' label='Seuraava sijainti'>
                                <MenuItem value=''>Tyhjä</MenuItem>
                                {
                                    locations.map((location) => (
                                        <MenuItem key={location._id} value={location._id}>{location.location}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    value={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                            }
                            label='Alkuperäinen'
                        />
                        <Button color='primary' onClick={() => addLocation()}>Tallenna</Button>
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
                            {isOpen ? 'Piilota sijainnit' : 'Näytä sijainnit'}
                            {
                                isOpen
                                    ?
                                    <SettingsLocationTable newCard={createdLocation} />
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

export default SettingsLocation;