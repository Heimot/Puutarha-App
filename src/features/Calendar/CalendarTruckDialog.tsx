import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'

import dayjs from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FetchData from '../Components/Fetch';
import { TruckData } from '../../Model';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    truckData: TruckData | null;
}

const CalendarTruckDialog: React.FC<Props> = ({ isOpen, setIsOpen, truckData }) => {
    const [info, setInfo] = useState<string>('');
    const [exists, setExists] = useState<boolean>(false);

    useEffect(() => {

        const getInfo = async () => {
            if (!truckData) return;
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const cInfo = await FetchData({ urlHost: url, urlPath: '/calendar/get_calendar_info', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&truck=${truckData?.truck._id}&date=${dayjs(truckData.deliverydate)}` });
            if (cInfo?.result !== null) {
                setExists(true);
                setInfo(cInfo?.result?.info);
            }
        }
        getInfo();

        return () => {
            setInfo('');
            setExists(false);
        }
    }, [])

    const saveInfo = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        if (exists) {
            let body = {
                date: dayjs(truckData?.deliverydate),
                truck: truckData?.truck._id,
                value: [
                    {
                        propName: "info",
                        value: info
                    }
                ]
            }
            await FetchData({ urlHost: url, urlPath: '/calendar/edit_calendar', urlMethod: 'PATCH', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}`, urlBody: body });
            setIsOpen(false);
        } else {
            let body = {
                currentUserId: userId,
                info: info,
                truck: truckData?.truck._id,
                date: dayjs(truckData?.deliverydate)
            };
            await FetchData({ urlHost: url, urlPath: '/calendar/create_calendar', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
            setIsOpen(false);
        }
    }

    return (
        <Dialog
            onClose={() => setIsOpen(false)}
            fullWidth={true}
            maxWidth={"xs"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Rekka info
                <IconButton
                    aria-label="close"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <Typography sx={{ fontSize: '20px' }}>Rekka: {truckData?.truck.truckLicensePlate}</Typography>
                    <Typography sx={{ fontSize: '20px' }}>Toimituspäivä: {dayjs(truckData?.deliverydate).format('DD-MM-YYYY')}</Typography>
                    <TextField sx={{ marginTop: '15px' }} label="Rekka info" multiline fullWidth value={info} onChange={(e: any) => setInfo(e.target.value)} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={() => saveInfo()} >
                    Tallenna
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default CalendarTruckDialog