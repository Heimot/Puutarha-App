import React, { useState, useEffect, useRef } from 'react'
import { TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import { Role } from '../../../Model';
import FetchData from '../../Components/Fetch';
import Roles from './Roles';
import Message from '../../Components/Message';
import MenuDialog from '../../Components/MenuDialog';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: 'solid 1px black'
}));

const SettingsRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [role, setRole] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const newRole = useRef<any>();

    const [chosenPermissions, setChosenPermissions] = useState<string[]>(['/auth/get_my_user_data']);

    useEffect(() => {
        const getRole = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/roles/get_roles', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setRoles(fetchRoles.result);
        }
        getRole();

        return () => {
            setRoles([]);
            setRole('');
        }
    }, [])

    const updateRole = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        if (role === '') {
            if (newRole.current.value === '') return alert('Et voi luoda roolia jolla ei ole nimeä.');
            let body = {
                currentUserId: userId,
                role: newRole.current.value,
                rights: chosenPermissions,
                default: isDefault
            }
            const createRole = await FetchData({ urlHost: url, urlPath: '/roles/create_role', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
            // If new value is default the older one needs to be flicked to false this is also done server side but should also be done here client side as well.
            if (isDefault) {
                setRoles(prevState => [...prevState.map((prev) => { return prev.default ? { ...prev, default: false } : prev })]);
            }
            setRoles(prevState => [...prevState, createRole.result]);
            setRole(createRole.result._id);
            setMessageOpen(true);
        } else {
            if (newRole.current.value === '') return alert('Et voi jättää nimeä tyhjäksi.');
            let body = [
                {
                    propName: 'role',
                    value: newRole.current.value
                },
                {
                    propName: 'rights',
                    value: chosenPermissions
                },
                {
                    propName: 'default',
                    value: isDefault
                },
            ]
            await FetchData({ urlHost: url, urlPath: '/roles/edit_role', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${userId}&currentRoleId=${role}` });

            // If new value is default the older one needs to be flicked to false this is also done server side but should also be done here client side as well.
            if (isDefault) {
                setRoles(prevState => [...prevState.map((prev) => { return prev.default ? { ...prev, default: false } : prev })]);
            }
            setRoles(prevState => [...prevState.filter((prev) => { return prev._id !== role }), { _id: role, role: newRole.current.value, rights: chosenPermissions, default: isDefault }]);
            setMessageOpen(true);
        }
    }

    const chosenRole = (id: string) => {
        if (id !== '') {
            const cRole = roles?.filter((item) => {
                return item._id === id
            })[0];
            setChosenPermissions(cRole?.rights as string[]);
            setIsDefault(cRole?.default as boolean);
            newRole.current.value = cRole?.role;
        } else {
            setChosenPermissions(['/auth/get_my_user_data']);
            setIsDefault(false);
            newRole.current.value = '';
        }
    }

    const addRole = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setChosenPermissions(prevState => [...prevState, e.target.value]);
        } else {
            setChosenPermissions(prevState => [...prevState.filter((perm) => {
                return perm !== e.target.value;
            })])
        }
    }

    const deleteRole = async () => {
        if (role === '') return alert('Sinun pitää valita poistettava rooli ensin');
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: role
        }
        await FetchData({ urlHost: url, urlPath: '/roles/delete_role', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
        setRoles(prevState => [...prevState.filter((prev) => { return prev._id !== role })]);
        setRole('');
        newRole.current.value = '';
        setChosenPermissions(['/auth/get_my_user_data'])
    }

    return (
        <Grid container sx={{ width: '100%', padding: '10px' }} justifyContent={'center'} alignItems={'center'}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
                        <Box>
                            <Typography>
                                {'Muokkaa roolia (Jätä tyhjäksi mikäli luot uutta roolia)'}
                            </Typography>
                            <FormControl fullWidth sx={{ marginTop: '5px' }}>
                                <InputLabel id='roles-label'>Rooli</InputLabel>
                                <Select label='Rooli' labelId='roles-label' value={role} onChange={(e) => { setRole(e.target.value); chosenRole(e.target.value); }}>
                                    <MenuItem value=''>{'Tyhjä (Uusi rooli)'}</MenuItem>
                                    {
                                        roles?.map((role) => (
                                            <MenuItem key={role?._id} value={role?._id}>{role?.role}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ marginTop: '20px' }}>
                            <Typography>Roolin nimi</Typography>
                            <TextField inputRef={newRole} fullWidth sx={{ marginTop: '5px' }} />
                        </Box>
                        <FormControlLabel
                            sx={{ display: 'flex', textAlign: 'left', justifyContent: 'center' }}
                            control={
                                <Switch
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                            }
                            label='Default'
                        />
                        <Button onClick={() => updateRole()}>{role === '' ? 'Luo rooli' : 'Päivitä roolia'}</Button>
                        {role !== '' && <Button color='error' onClick={() => setIsOpen(true)}>{'Poista'}</Button>}
                    </Box>
                    <FormGroup>
                        {
                            Roles.map((role) => {
                                return (
                                    <Item key={role.name} sx={{ marginBottom: '20px' }}>
                                        <Typography>{role.name}</Typography>
                                        <Grid container>
                                            {role.permissions.map((perm, index) => (
                                                <Grid xs={12} md={4} lg={3} key={index}>
                                                    <FormControlLabel
                                                        sx={{ display: 'flex', textAlign: 'left' }}
                                                        control={
                                                            <Switch
                                                                value={perm.path}
                                                                disabled={perm?.disabled ? true : false}
                                                                checked={perm?.disabled ? true : chosenPermissions?.includes(perm.path) || chosenPermissions?.includes('*')}
                                                                onChange={(e) => addRole(e)}
                                                            />
                                                        }
                                                        label={perm.label}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Item>
                                )
                            })
                        }
                    </FormGroup>
                </Item>
            </Grid>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle={'Rooli'}>
                        Rooli on luotu/päivitetty onnistuneesti.
                    </Message>
                    :
                    null
            }
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteRole()} dialogTitle={'Haluatko poistaa tämän roolin?'} actions={true}>
                {`Haluatko varmasti poistaa roolin ${newRole?.current?.value} (${role})? Mikäli poistat roolin sitä ei voida enää palauttaa ja käyttäjät joilla rooli oli, ei ole enää oikeuksia.`}
            </MenuDialog>
        </Grid >
    )
}

export default SettingsRoles