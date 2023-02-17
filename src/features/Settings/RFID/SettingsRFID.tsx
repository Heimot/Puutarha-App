import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsRFIDTable from './SettingsRFIDTable';
import Paper from '@mui/material/Paper';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Card, Message as ModelMessage, User } from '../../../Model';
import Message from '../../Components/Message';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsRFID = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [cardOwner, setCardOwner] = useState<string>('');
    const [cardNumber, setUsername] = useState<string>('');
    const [user, setUser] = useState<string>('');
    const [createdRFID, setCreatedRFID] = useState<Card | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

    useEffect(() => {
        const getUsers = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/auth/get_all_users', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setUsers(fetchRoles.result)
        }
        getUsers();

        return () => {
            setUsers([]);
        }
    }, [])

    const addRFID = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let cardAccount = null;
        if (user !== '') cardAccount = user;
        let body = {
            currentUserId: userId,
            cardOwner: cardOwner,
            cardNumber: cardNumber,
            cardAccount: cardAccount
        }

        const createRFID = await FetchData({ urlHost: url, urlPath: '/card/add_card', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        console.log(createRFID)
        setCreatedRFID(createRFID.result);
        if (createRFID?.result) {
            setMessage({ title: 'RFID käyttäjä lisätty.', message: 'Käyttäjä on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (createRFID?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko kortti jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px' }}>
                        <Typography>
                            Lisää RFID käyttäjä
                        </Typography>
                        <TextField value={cardOwner} onChange={(e) => setCardOwner(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Nimi' />
                        <TextField value={cardNumber} onChange={(e) => setUsername(e.target.value)} sx={{ margin: '5px 0 5px 0' }} label='Kortti' />
                        <Typography sx={{ fontSize: '10px' }}></Typography>
                        <FormControl sx={{ margin: '5px 0 5px 0' }}>
                            <InputLabel id='RFIDUSER_ID'>Käyttäjä (EI PAKOLLINEN)</InputLabel>
                            <Select value={user} onChange={(e) => setUser(e.target.value)} labelId='RFIDUSER_ID' label='Käyttäjä (EI PAKOLLINEN)'>
                                <MenuItem value=''>Tyhjä</MenuItem>
                                {
                                    users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
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
                            {isOpen ? 'Piilota kortit' : 'Näytä kortit'}
                            {
                                isOpen
                                    ?
                                    <SettingsRFIDTable newCard={createdRFID} />
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

export default SettingsRFID;