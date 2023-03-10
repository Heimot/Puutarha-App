import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Order, Truck } from '../../Model';
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    order: Order;
    trucks: Truck[] | null;
    updateCalendar: (order: Order, truck: Truck, position: Number | string) => void;
    openOrder: (value: boolean) => void;
}

const CalendarDialog: React.FC<Props> = ({ isOpen, setIsOpen, order, trucks, updateCalendar, openOrder }) => {
    const [chosenTruck, setChosenTruck] = useState<string>('');
    const [calendarPosition, setCalendarPosition] = useState<Number | string>(0);

    useEffect(() => {
        if (order?.truck?._id) {
            setChosenTruck(order?.truck?._id);
        } else {
            setChosenTruck('');
        }
        setCalendarPosition(order?.calendarPosition);

        return () => {
            setChosenTruck('');
            setCalendarPosition(0);
        }
    }, [])

    const isEmpty = () => {
        if (calendarPosition === '') {
            setCalendarPosition(0);
        }
    }

    const updateOrder = async () => {
        if (trucks === null) return;
        if (chosenTruck === '') return alert('You cannot leave truck field empty.');
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                propName: "calendarPosition",
                value: calendarPosition
            },
            {
                propName: "truck",
                value: chosenTruck
            }
        ]
        await FetchData({ urlHost: url, urlPath: '/orders/edit_order', urlMethod: 'PATCH', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentOrderId=${order._id}`, urlBody: body });
        let truckData = trucks.filter((truck) => {
            return truck._id === chosenTruck;
        })
        updateCalendar(order, truckData[0], calendarPosition);
        setIsOpen(false);
    }

    return (
        <Dialog
            onClose={() => setIsOpen(false)}
            fullWidth={true}
            maxWidth={"xs"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Kalenteri
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
                    <Typography sx={{ fontSize: '20px' }}>{order?.store?.name}</Typography>
                    <Typography sx={{ fontSize: '20px' }}>Keräyspäivä: {dayjs(order?.pickingdate).format('DD-MM-YYYY')}</Typography>
                    <Typography sx={{ fontSize: '20px' }}>Toimituspäivä: {dayjs(order?.deliverydate).format('DD-MM-YYYY')}</Typography>
                </Box>
                <Box sx={{ marginTop: '15px' }}>
                    {
                        trucks !== null
                        &&
                        <FormControl fullWidth>
                            <InputLabel id='truck-label'>Rekka</InputLabel>
                            <Select label='Rekka' labelId='truck-label' value={chosenTruck} onChange={(e) => setChosenTruck(e.target.value)}>
                                {
                                    trucks?.map((truck: any) => {
                                        return (
                                            <MenuItem value={truck?._id} key={truck._id}>
                                                {truck.truckLicensePlate}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                            <TextField type="number" label='Järjestys numero' sx={{ marginTop: '10px' }} value={calendarPosition} onBlur={isEmpty} onChange={(e) => setCalendarPosition(e.target.value)} />
                        </FormControl>
                    }
                </Box>
            </DialogContent>
            <DialogActions>
                <Button sx={{ marginRight: 'auto' }} onClick={() => openOrder(true)}>Tilaus</Button>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={() => updateOrder()} >
                    Tallenna
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default CalendarDialog;