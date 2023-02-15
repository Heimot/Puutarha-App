import React, { useState, useEffect, useRef } from 'react'
import { TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { styled, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import { Role } from '../../Model';
import FetchData from '../Components/Fetch';
import Roles from './Roles';

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
        if (role === '') {
            if (newRole.current.value === '') return alert('Et voi luoda roolia jolla ei ole nimeä.');
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            let body = {
                currentUserId: userId,
                role: newRole.current.value,
                rights: chosenPermissions,
                default: isDefault
            }
            const createRole = await FetchData({ urlHost: url, urlPath: '/roles/create_role', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
            setRoles(prevState => [...prevState, createRole.result]);
            setRole(createRole.result._id)
        } else {

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

    useEffect(() => {
        console.log(chosenPermissions)
    }, [chosenPermissions])

    const addRole = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setChosenPermissions(prevState => [...prevState, e.target.value]);
        } else {
            setChosenPermissions(prevState => [...prevState.filter((perm) => {
                return perm !== e.target.value;
            })])
        }
    }

    return (
        <Grid container sx={{ width: '100%', padding: '10px' }} justifyContent={'center'} alignItems={'center'}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Box sx={{ maxWidth: '500px' }}>
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
        </Grid >
    )
}

export default SettingsRoles