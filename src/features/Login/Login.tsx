import React, { useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link as MUILink, Paper, Box, Grid, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BackgroundImg from '../../img/Puutarha.jpg'
import { useNavigate } from 'react-router-dom';
import FetchData from '../Components/Fetch';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <MUILink color="inherit" href="mailto:&#x68;&#x65;&#x69;&#x6d;&#x6f;&#x6e;&#x65;&#x6e;&#x6a;&#x6f;&#x6f;&#x6e;&#x61;&#x73;&#x40;&#x67;&#x6d;&#x61;&#x69;&#x6c;&#x2e;&#x63;&#x6f;&#x6d;&#xa;">
                Joonas Heimonen
            </MUILink>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}


const Login = () => {
    const [fail, setFail] = useState<boolean>(false);
    const dispatch = useDispatch();
    const { setUserData } = bindActionCreators(actionCreators, dispatch);

    const navigate = useNavigate();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let url = process.env.REACT_APP_API_URL;
        let response = await FetchData({ urlHost: url, urlPath: '/auth/login', urlMethod: 'POST', urlHeaders: 'NoAuth', urlBody: { email: data.get('email'), password: data.get('password') } })
        if (!response.accessToken) return setFail(true);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('userId', response.user._id);
        setUserData(response.user);
        navigate('/dashboard');
        window.location.reload()
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: `url(${BackgroundImg})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Kirjaudu sisään
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {
                            fail
                            &&
                            <Typography color={'red'} textAlign={'center'}>Kirjautuminen epäonnistui, tarkista käyttäjänimi ja salasana.</Typography>
                        }
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Käyttäjä"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Salasana"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            sx={{ opacity: 0, cursor: 'default' }}
                            control={<Checkbox sx={{ cursor: 'default' }} value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Kirjaudu sisään
                        </Button>
                        <Copyright sx={{ mt: 5 }} />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default Login;
