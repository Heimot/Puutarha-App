import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, InputLabel, InputAdornment, IconButton, FormControl } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import SettingsUsersTable from './SettingsUsersTable';
import Paper from '@mui/material/Paper';
import validator from 'validator';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FetchData from '../../Components/Fetch';
import { Message as ModelMessage, Role, User } from '../../../Model';
import Message from '../../Components/Message';

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
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [createdUser, setCreatedUser] = useState<User | undefined>();
    const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });

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

    const addUser = async () => {
        if (validator.isStrongPassword(password, {
            minLength: 8, minLowercase: 1,
            minUppercase: 1, minNumbers: 1,
            minSymbols: 1
        })) {
            setPasswordError(false);
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            let body = {
                currentUserId: userId,
                email: email,
                username: username,
                password: password,
                role: role
            }

            const createUser = await FetchData({ urlHost: url, urlPath: '/auth/sign_up', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
            setCreatedUser(createUser.result);
            if (createUser?.result) {
                setMessage({ title: 'Käyttäjä lisätty.', message: 'Käyttäjä on luotu onnistuneesti.' });

                setMessageOpen(true);
            } else if (createUser?.usernameError) {
                setMessage({ title: 'Error', message: 'Käyttäjänimi on jo käytössä.' });
                setMessageOpen(true);
            } else if (createUser?.emailError) {
                setMessage({ title: 'Error', message: 'Sähköposti on jo käytössä.' });
                setMessageOpen(true);
            }
        } else {
            setPasswordError(true);
        }

    }

    return (
        <Grid container sx={{ padding: '10px', width: '100%' }}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px' }}>
                        <Typography>
                            Lisää käyttäjiä
                        </Typography>
                        <TextField value={email} onChange={(e) => setEmail(e.target.value)} sx={{ margin: '10px 0 5px 0' }} label='Sähköposti' />
                        <TextField value={username} onChange={(e) => setUsername(e.target.value)} sx={{ margin: '5px 0 5px 0' }} label='Käyttäjänimi' />
                        <FormControl sx={{ margin: '5px 0 5px 0', maxWidth: '300px' }} variant="outlined">
                            <TextField
                                label="Salasana"
                                id="password-field"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={passwordError}
                                helperText={'Salasanassa on oltava vähintään kahdeksan merkkiä. Käytä isoja ja pieniä kirjaimia, numeroita ja erikoismerkkejä.'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </FormControl>
                        <Typography sx={{ fontSize: '10px' }}></Typography>
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
                        <Button color='primary' onClick={() => addUser()}>Tallenna</Button>
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
                                    <SettingsUsersTable newUser={createdUser} />
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

export default SettingsUsers