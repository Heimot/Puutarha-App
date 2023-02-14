import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { styled, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import { Role } from '../../Model';
import FetchData from '../Components/Fetch';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const SettingsRoles = () => {
    const [roles, setRoles] = useState<Role[]>();
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        const getRole = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/roles/get_roles', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });

            const defaultRole = fetchRoles.result.filter((role: Role) => {
                return role.default;
            });

            setRoles(fetchRoles.result);
            setRole(defaultRole[0]._id);
        }
        getRole();

        return () => {
            setRoles(undefined);
            setRole('');
        }
    }, [])

    return (
        <Grid container sx={{ width: '100%', padding: '10px' }} justifyContent={'center'} alignItems={'center'}>
            <Grid xs={12}>
                <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Box sx={{ maxWidth: '500px' }}>
                        <Box>
                            <Typography>
                                Muokkaa roolia
                            </Typography>
                            <FormControl fullWidth sx={{ marginTop: '5px' }}>
                                <InputLabel id='roles-label'>Rooli</InputLabel>
                                <Select label='Rooli' labelId='roles-label' value={role} onChange={(e: any) => setRole(e.target.value)}>
                                    {
                                        roles?.map((role) => (
                                            <MenuItem key={role?._id} value={role?._id}>{role?.role}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ marginTop: '20px' }}>
                            <Typography>
                                Luo uusi rooli
                            </Typography>
                            <TextField sx={{ marginTop: '5px' }} />
                        </Box>
                        <Button>Luo rooli</Button>
                    </Box>
                    <FormGroup>
                        <Grid container>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={(e) => console.log(e.target.checked)}
                                    />
                                }
                                label="Voi nähdä kaikki käyttäjät"
                            />
                        </Grid>
                    </FormGroup>
                </Item>
            </Grid>
        </Grid >
    )
}

export default SettingsRoles