import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import FetchData from '../Components/Fetch';
import Message from '../Components/Message';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';
import { Settings } from '../../Model';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const PersonalSettings = () => {
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [empty, setEmpty] = useState<boolean>(false);
    const [rfid, setRfid] = useState<boolean>(false);

    const { userData } = useSelector((state: State) => state.data);

    const dispatch = useDispatch();
    const { setUserData } = bindActionCreators(actionCreators, dispatch);

    useEffect(() => {
        const getSettings = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchSettings = await FetchData({ urlHost: url, urlPath: '/settings/get_personal_settings', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            if (!fetchSettings?.result?.personalSettings) return;
            setSettings(fetchSettings?.result?.personalSettings);
            setEmpty(fetchSettings?.result?.personalSettings?.showEmptyOrders);
            setRfid(fetchSettings?.result?.personalSettings?.disableRFIDScanning);
        }
        getSettings();

        return () => {
            setSettings(null);
        }
    }, [])

    const updateSettings = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                propName: "showEmptyOrders",
                value: empty
            },
            {
                propName: "disableRFIDScanning",
                value: rfid
            }
        ]
        const personal = await FetchData({ urlHost: url, urlPath: '/settings/edit_personal_settings', urlMethod: 'PATCH', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentSettingsId=${settings?._id}`, urlBody: body });
        setUserData({ ...userData, showEmptyOrders: empty, disableRFIDScanning: rfid });
        setMessageOpen(true);
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    {
                        settings
                        &&
                        <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px' }}>
                            <FormControlLabel
                                sx={{ display: 'flex', textAlign: 'left' }}
                                control={
                                    <Switch
                                        value={empty}
                                        checked={empty}
                                        onChange={(e) => setEmpty(e.target.checked)}
                                    />
                                }
                                label='Piilota tyhjät tilaukset'
                            />
                            <FormControlLabel
                                sx={{ display: 'flex', textAlign: 'left' }}
                                control={
                                    <Switch
                                        value={rfid}
                                        disabled={userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/orders/create_order_with_products') ? false : true}
                                        checked={rfid}
                                        onChange={(e) => setRfid(e.target.checked)}
                                    />
                                }
                                label='RFID Scannaus pois päältä (vain tältä käyttäjältä)'
                            />
                        </Grid>
                    }
                    <Button onClick={() => updateSettings()}>Päivitä asetukset</Button>
                </Item>
            </Grid>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Asetukset'>
                    Asetukset on tallennettu.
                </Message>
            }
        </Grid>
    )
}

export default PersonalSettings;