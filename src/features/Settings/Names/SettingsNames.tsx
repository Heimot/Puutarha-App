import React, { useState } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsNamesTable from './SettingsNamesTable';
import Paper from '@mui/material/Paper';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Flower, Message as ModelMessage, Store } from '../../../Model';
import Message from '../../Components/Message';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsNames = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isFlowerOpen, setIsFlowerOpen] = useState<boolean>(false);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [group, setGroup] = useState<string>('');
    const [createdObject, setCreatedObject] = useState<Store | Flower | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

    const addObject = async () => {
        if (group === '') return alert('You need to choose a group!');
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            name: name,
            group: group
        }

        const createRFID = await FetchData({ urlHost: url, urlPath: '/names/create_name', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setCreatedObject(createRFID.result);
        if (createRFID?.result) {
            setMessage({ title: 'Nimi lisätty.', message: 'Nimi on luotu onnistuneesti.' });

            setMessageOpen(true);
        } else if (createRFID?.error) {
            setMessage({ title: 'Error', message: 'Jokin meni vikaan tarkasta onko nimi jo olemassa.' });
            setMessageOpen(true);
        }
    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px' }}>
                        <Typography>
                            Lisää kukka tai kauppa
                        </Typography>
                        <TextField value={name} onChange={(e) => setName(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Nimi' />
                        <FormControl sx={{ margin: '5px 0 5px 0' }}>
                            <InputLabel id='GROUP_ID'>Kukka vai kauppa</InputLabel>
                            <Select value={group} onChange={(e) => setGroup(e.target.value)} labelId='GROUP_ID' label='Kukka vai kauppa'>
                                <MenuItem value='Flowers'>Kukka</MenuItem>
                                <MenuItem value='Stores'>Kauppa</MenuItem>
                            </Select>
                        </FormControl>
                        <Button color='primary' onClick={() => addObject()}>Tallenna</Button>
                    </Grid>
                    <Grid container xs={12}>
                        <Grid xs={12} md={6}>
                            <Item>
                                <KeyboardArrowDown
                                    onClick={() => setIsOpen(!isOpen)}
                                    sx={{
                                        mr: -1,
                                        transform: isOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                        transition: '0.2s',
                                    }}
                                />
                                {isOpen ? 'Piilota kaupat' : 'Näytä kaupat'}
                                {
                                    isOpen
                                        ?
                                        <SettingsNamesTable newCard={createdObject} group={'Stores'} passValue={(value) => setCreatedObject(value)} resetValue={() => setCreatedObject(undefined)} />
                                        :
                                        null
                                }
                            </Item>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <Item>
                                <KeyboardArrowDown
                                    onClick={() => setIsFlowerOpen(!isFlowerOpen)}
                                    sx={{
                                        mr: -1,
                                        transform: isFlowerOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                        transition: '0.2s',
                                    }}
                                />
                                {isFlowerOpen ? 'Piilota kukat' : 'Näytä kukat'}
                                {
                                    isFlowerOpen
                                        ?
                                        <SettingsNamesTable newCard={createdObject} group={'Flowers'} passValue={(value) => setCreatedObject(value)} resetValue={() => setCreatedObject(undefined)} />
                                        :
                                        null
                                }
                            </Item>
                        </Grid>
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

export default SettingsNames;