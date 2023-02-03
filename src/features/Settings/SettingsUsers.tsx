import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import SettingsUsersTable from './SettingsUsersTable';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../Components/Fetch';
import { Role } from '../../Model';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsUsers = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        const getRoles = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/roles/get_roles', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            const defaultRole = fetchRoles.result.filter((role: Role) => {
                return role.default;
            })
            setRole(defaultRole[0]._id)
            setRoles(fetchRoles.result)
        }
        getRoles();

        return () => {
            setRoles([]);
        }
    }, [])

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }} alignItems={'center'} direction={'column'}>
            <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0' }}>
                <Typography>
                    Lisää käyttäjiä
                </Typography>
                <TextField value={email} onChange={(e) => setEmail(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Sähköposti' />
                <TextField value={username} onChange={(e) => setUsername(e.target.value)} sx={{ margin: '5px 0 5px 0' }} label='Käyttäjänimi' />
                <FormControl sx={{ margin: '5px 0 5px 0' }} variant="outlined">
                    <InputLabel htmlFor="password-field">Salasana</InputLabel>
                    <OutlinedInput
                        id="password-field"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>
                <FormControl sx={{ margin: '5px 0 5px 0' }}>
                    <InputLabel id='Role_ID'>Rooli</InputLabel>
                    <Select value={role} onChange={(e) => setRole(e.target.value)} labelId='Role_ID' label='Rooli'>
                        {
                            roles.map((role) => (
                                <MenuItem key={role._id} value={role._id}>{role.role}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <Button color='primary'>Tallenna</Button>
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
                    {isOpen ? 'Piilota käyttäjät' : 'Näytä käyttäjät'}
                    {
                        isOpen
                            ?
                            <SettingsUsersTable />
                            :
                            null
                    }
                </Item>
            </Grid>
        </Grid>
    )
}

export default SettingsUsers