import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table';
import dayjs from 'dayjs';
import { Order } from '../../Model';
import FetchData from '../Components/Fetch';
import CalendarOrderData from './CalendarOrderData';

import CloseIcon from '@mui/icons-material/Close';

interface Props {
    isOpen: boolean;
    id: string;
    setIsOpen: (value: boolean) => void;
}

const CalendarOrder: React.FC<Props> = ({ isOpen, setIsOpen, id }) => {
    const [order, setOrder] = useState<Order | null>(null);

    const theme = useTheme();

    useEffect(() => {
        if (!id) return;
        const getOrder = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const orderData = await FetchData({ urlHost: url, urlPath: '/orders/get_order', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentOrderId=${id}` });
            if (!orderData?.result) return;
            setOrder(orderData?.result);
        }

        getOrder();
        return () => {
            setOrder(null);
        }
    }, [id])

    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const handleClose = (event: any, reason: string) => {
        if (reason && reason === "backdropClick")
            return;
        setIsOpen(!isOpen);
    }

    return (
        <Dialog
            onClose={handleClose}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Tilaus
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
                <Grid container xs={12}>
                    <Grid xs={12} sm={6}>
                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Keräyspäivämäärä: {dayjs(order?.pickingdate).format('DD-MM-YYYY')}</Typography>
                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Toimituspäivämäärä: {dayjs(order?.deliverydate).format('DD-MM-YYYY')}</Typography>
                        <Typography sx={{ fontSize: 20, paddingTop: 1, paddingBottom: 1 }} align="left" variant='h1'>{order?.store?.name}</Typography>
                        <Typography sx={{ fontSize: 15 }} align="left" variant='h1'>{order?._id}</Typography>
                    </Grid>
                    <Grid xs={12} sm={6} sx={{ padding: 0 }}>
                        <Grid xs={12} >
                            <Typography align='right'>{order?.information}</Typography>
                        </Grid>
                        <Grid xs={12}>
                            <Typography align='right'>{order?.ordercode}</Typography>
                        </Grid>
                    </Grid>
                    <Grid xs={12} sm={6}>
                        {
                            order?.statusLocation?.map((sLoc: any) => (
                                <Grid key={sLoc?._id} sx={{ paddingLeft: 0, paddingTop: 0 }} xs={12}>
                                    <Typography align='left'>{sLoc?.location?.location}: {sLoc?.status?.status}</Typography>

                                </Grid>
                            ))
                        }
                    </Grid>
                    <Grid xs={12} sm={6}>
                        <Typography align='right'>Rullakko: {order?.roller?.roller}</Typography>
                    </Grid>
                </Grid>
                <Table style={{
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
                }}>
                    <Thead>
                        <Tr>
                            <Th>Tuote</Th>
                            <Th>Kerätään</Th>
                            <Th>Keräyspiste</Th>
                            <Th>Lisätietoa</Th>
                            <Th>Keräämässä</Th>
                            <Th>Kerättymäärä</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            order?.products?.map((product) => (
                                <CalendarOrderData key={product._id} product={product} />
                            ))
                        }
                    </Tbody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus onClick={handleClick}>
                    Sulje
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default CalendarOrder;