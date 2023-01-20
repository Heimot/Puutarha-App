import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import Login from './features/Login/Login';
import Main from './features/MainMenu/Main';
import NavigationBar from './features/Navigation/NavigationBar';

import { useSelector, useDispatch } from 'react-redux';
import { State } from './app/redux/store';
import FetchData from './features/Components/Fetch';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from './app/redux/actions';
import dayjs from 'dayjs';
import Settings from './features/Settings/Settings';
import Calendar from './features/Calendar/Calendar';

const App = () => {
  const { userData } = useSelector((state: State) => state.data);

  const dispatch = useDispatch();
  const { setUserData, setStatus, setState, setLocation, setPDF, setChosenDate } = bindActionCreators(actionCreators, dispatch);
  const navigate = useNavigate();

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
  );
}

export default App;