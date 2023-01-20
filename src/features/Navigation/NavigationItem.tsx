import React, { useState, useEffect } from 'react'
import { Box, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DoneIcon from '@mui/icons-material/Done';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';
import { useNavigate } from 'react-router';
import FetchData from '../Components/Fetch';

interface Props {
    toggleDrawer: (event: any) => void;
}

interface Status {
    _id: string;
    status: string;
    nextStatus: string;
    color: string;
    fontcolor: string;
    default: boolean;
}

interface Location {
    _id: string;
    location: string;
    default: boolean;
    nextLocation: string;
}

const NavigationItem: React.FC<Props> = ({ toggleDrawer }) => {
    const [statusOrder, setStatusOrder] = useState<Status[] | null>(null);
    const [locationOrder, setLocationOrder] = useState<Location[] | null>(null);

    const { statusSettings, locationSettings, chosenStatus, chosenLocation, chosenDate } = useSelector((state: State) => state.data);

    const dispatch = useDispatch();
    const { setChosenStatus, setChosenLocation, setChosenDate, setUserData } = bindActionCreators(actionCreators, dispatch);

    const navigate = useNavigate();


    useEffect(() => {
        let statusSettingsOrder = [];
        let defaultStatus;
        if (!statusSettings) return;
        for (let i = 0; i < statusSettings.length; i++) {
            if (statusSettings[i].default) {
                defaultStatus = statusSettings[i];
                setChosenStatus(statusSettings[i]._id);
            }
            statusSettingsOrder.push({});
        }

        let nextId = defaultStatus?.nextStatus;
        for (let i = 0; i < statusSettings.length; i++) {

            if (defaultStatus?.default) {
                statusSettingsOrder[0] = defaultStatus;
                defaultStatus = null;
            } else {
                defaultStatus = statusSettings.filter((status: Status) => {
                    return status._id === nextId;
                })[0];
                statusSettingsOrder[i] = defaultStatus;
                nextId = defaultStatus.nextStatus;
            }
        }
        setStatusOrder(statusSettingsOrder);
        return () => {
            setStatusOrder(null);
        }
    }, [statusSettings])

    useEffect(() => {
        let locationSettingsOrder = [];
        let defaultLocation;

        if (!locationSettings) return;
        for (let i = 0; i < locationSettings.length; i++) {
            if (locationSettings[i].default) {
                defaultLocation = locationSettings[i];
                setChosenLocation(locationSettings[i]._id);
            }
            locationSettingsOrder.push({});
        }

        let nextId = defaultLocation?.nextLocation;
        for (let i = 0; i < locationSettings.length; i++) {

            if (defaultLocation?.default) {
                locationSettingsOrder[0] = defaultLocation;
                defaultLocation = null;
            } else {
                defaultLocation = locationSettings.filter((location: Location) => {
                    return location._id === nextId;
                })[0];
                locationSettingsOrder[i] = defaultLocation;
                nextId = defaultLocation.nextLocation;
            }
        }
        setLocationOrder(locationSettingsOrder);
        return () => {
            setLocationOrder(null);
        }
    }, [locationSettings])


    const handleChange = (e: any) => {
        if (e.target.name === "Tilanne") {
            setChosenStatus(e.target.value);
        } else {
            setChosenLocation(e.target.value);
        }
    }

    const goToPage = async (value: string) => {
        if (value === "Kirjaudu ulos") {
            let url = process.env.REACT_APP_API_URL;
            let data = await FetchData({ urlHost: url, urlPath: '/auth/log_out', urlMethod: 'DELETE', urlHeaders: 'Auth' });
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setUserData(null);
            navigate('/');
            console.log(data)
        } else if (value === "Asetukset") {
            navigate('/dashboard/settings');
        } else if (value === "Kalenteri") {
            navigate('/dashboard/calendar');
        } else {
            navigate('/dashboard');
        }
    }

    return (
        <Box
            sx={{ width: 250 }}
            role="presentation"
        >
            <List>
                {['Keräykseen', 'Kalenteri', 'Tilanne', 'Paikka', 'Päivä', 'Lisää'].map((text) => (
                    <ListItem key={text} disablePadding>
                        {text !== "Tilanne" && text !== "Paikka" && text !== "Päivä" ?
                            <ListItemButton onClick={(e: any) => { goToPage(text); toggleDrawer(e); }} onKeyDown={toggleDrawer}>
                                <ListItemIcon>
                                    {text === "Kalenteri" ? <CalendarMonthIcon /> : text === "Keräykseen" ? <WorkIcon /> : <AddIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                            :
                            text !== "Päivä" ?
                                <ListItemButton>

                                    <ListItemIcon>
                                        {text === "Paikka" ? <LocationOnIcon /> : <DoneIcon />}
                                    </ListItemIcon>
                                    <FormControl fullWidth>

                                        <InputLabel id="Tilanne_ID">{text}</InputLabel>
                                        <Select
                                            name={text}
                                            value={text === "Tilanne" ? statusOrder !== null ? chosenStatus : '' : locationOrder !== null ? chosenLocation : ''}
                                            labelId={`${text}_ID`}
                                            id={`${text}_ID`}
                                            label={text}
                                            onChange={(e: any) => { handleChange(e); toggleDrawer(e) }}
                                        >
                                            {text !== 'Tilanne' ? <MenuItem key={1} value="*">Molemmat</MenuItem> : null}
                                            {
                                                text === "Tilanne"
                                                    ?
                                                    statusOrder?.map((status: Status) => (
                                                        <MenuItem key={status._id} value={status._id}>{status.status}</MenuItem>
                                                    ))
                                                    :
                                                    locationOrder?.map((location: Location) => (
                                                        <MenuItem key={location._id} value={location._id}>{location.location}</MenuItem>
                                                    ))
                                            }
                                        </Select>
                                    </FormControl>

                                </ListItemButton >
                                :
                                <ListItemButton>
                                    <ListItemIcon>
                                        <CalendarTodayIcon />
                                    </ListItemIcon>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MobileDatePicker
                                            label="Keräyspäivä"
                                            value={chosenDate}
                                            inputFormat='DD.MM.YYYY'
                                            closeOnSelect={true}
                                            onChange={(newValue) => {
                                                setChosenDate(newValue.toString());
                                                toggleDrawer(newValue);
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </ListItemButton>
                        }
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['Asetukset', 'Kirjaudu ulos'].map((text) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={(e: any) => { goToPage(text); toggleDrawer(e); }}>
                            <ListItemIcon>
                                {text === "Asetukset" ? <SettingsIcon /> : <LogoutIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

export default NavigationItem