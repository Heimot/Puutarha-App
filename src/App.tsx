import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import Login from './features/Login/Login';
import Main from './features/MainMenu/Main';
import NavigationBar from './features/Navigation/NavigationBar';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';

import { useSelector, useDispatch } from 'react-redux';
import { State } from './app/redux/store';
import FetchData from './features/Components/Fetch';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from './app/redux/actions';
import dayjs from 'dayjs';
import Settings from './features/Settings/Settings';
import Calendar from './features/Calendar/Calendar';
import { SocketProvider } from './app/contexts/SocketProvider';

declare module '@mui/material/styles' {
  interface Theme {
    table: {
      light: string;
      dark: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    table?: {
      light?: string;
      dark?: string;
    };
  }
}

const App = () => {
  const { userData, chosenMode } = useSelector((state: State) => state.data);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const dispatch = useDispatch();
  const { setUserData, setStatus, setState, setLocation, setFlowers, setStores, setPDF, setChosenDate, setChosenMode } = bindActionCreators(actionCreators, dispatch);
  const navigate = useNavigate();

  useEffect(() => {
    let modeTheme = localStorage.getItem('theme');
    if (modeTheme === 'dark' || modeTheme === 'light') {
      setMode(modeTheme)
      setChosenMode(modeTheme);
    } else {
      setMode(chosenMode)
    }
  }, [chosenMode])

  useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 1500,
            lg: 2250,
            xl: 3000
          },
        },
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          }
        },
        table: {
          light: 'black',
          dark: 'white',
        }
      }),
    [mode],
  );

  useEffect(() => {
    let auth = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    if (!auth || !userId) return navigate('/');
    let url = process.env.REACT_APP_API_URL;
    const getData = async () => {
      let data = userData;
      if (data === null) {
        data = await FetchData({ urlHost: url, urlPath: '/auth/get_my_user_data', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
        setUserData(data.result);
      }
      if (data) {
        let applicationSettings = await FetchData({ urlHost: url, urlPath: '/settings/get_settings', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
        setStatus(applicationSettings.status);
        setState(applicationSettings.state);
        setLocation(applicationSettings.location);
        setFlowers(applicationSettings.flowers);
        setStores(applicationSettings.stores);
        setPDF(applicationSettings.pdf);

        setChosenDate(dayjs().toString())
        let path = window.location.pathname;
        if (path !== '/') {
          navigate(path);
        } else {
          navigate('/dashboard');
        }
      }
    }
    getData();
  }, [window.location.pathname])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div>
        {window.location.pathname.includes('/dashboard')
          ?
          <NavigationBar />
          :
          null}
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/dashboard' element={<Main />} />
          <Route path='/dashboard/settings' element={<Settings />} />
          <Route path='/dashboard/calendar' element={<Calendar />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;