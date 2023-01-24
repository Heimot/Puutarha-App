import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import { Order } from './Model';

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';

import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import './Main.css';
import MainTableData from './MainTableData';
import { Button, Typography } from '@mui/material';
import EditingMenu from './EditingMenu';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 1500,
            lg: 2250,
            xl: 3000
        },
    },
});

// #242526

const Main = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [editData, setEditData] = useState<Order | null>(null);
    const { chosenStatus, chosenLocation, chosenDate, stateSettings } = useSelector((state: State) => state.data);

    const dispatch = useDispatch();
    //const { setChosenStatus, setChosenLocation, setChosenDate, setUserData } = bindActionCreators(actionCreators, dispatch);

    useEffect(() => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        const getOrderData = async () => {
            if (!chosenDate) return;
            let date = dayjs(chosenDate).format('YYYY-MM-DD');
            let orderData = await FetchData({ urlHost: url, urlPath: '/orders/get_orders_with_date', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&date=${date}` });
            setOrders(orderData.result);
            console.log(orderData.result)
        }
        getOrderData();
        return () => { setOrders([]); userId = null; url = ''; }
    }, [chosenStatus, chosenLocation, chosenDate])

    const updatedData = (nextState: string, pickedAmount: number, orderId: string, productId: string) => {
        let next = stateSettings.filter((state: any) => {
            return state._id === nextState;
        })
        let data = orders.map((order) => {
            return order._id === orderId
                ?
                {
                    ...order, products: order.products.map((product) => {
                        return product._id === productId
                            ?
                            { ...product, state: next[0], amountToDeliver: pickedAmount }
                            :
                            product
                    })
                }
                : order;
        })
        setOrders(data);
    }

    const updateOrder = () => {
        let data = orders.map((order) => {
            return order._id === editData?._id
                ? editData
                : order;
        })
        setOrders(data);
        setEditData(null);
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 9, backgroundColor: '#212121', height: '100%', minHeight: '100vh' }}>

                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    {orders.map((order) => (
                        <Grid xs={12} sm={12} md={6} lg={4} xl={3} key={order._id}>
                            <Item>
                                <Grid container xs={12}>
                                    <Grid xs={6}>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Keräyspäivämäärä: {dayjs(order.pickingdate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Toimituspäivämäärä: {dayjs(order.deliverydate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20, paddingTop: 1, paddingBottom: 1 }} align="left" variant='h1'>{order.store.name}</Typography>
                                        <Typography sx={{ fontSize: 15 }} align="left" variant='h1'>{order._id}</Typography>
                                    </Grid>
                                    <Grid xs={6} sx={{ padding: 0 }}>
                                        <Grid xs={12} >
                                            <Typography align='right'>{order.information}</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Typography align='right'>{order.ordercode}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid xs={6}>
                                        <Typography align='left'>Location order status here with .map</Typography>
                                    </Grid>
                                    <Grid xs={6}>
                                        <Typography align='right'>Maybe some buttons here</Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                        Amount done meters here
                                    </Grid>
                                </Grid>
                                <Table>
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
                                            order?.products.map((product) => (
                                                <MainTableData
                                                    key={product._id}
                                                    product={product}
                                                    updateOrder={(nextState, pickedAmount) => updatedData(nextState, pickedAmount, order._id, product._id)}
                                                />
                                            ))
                                        }
                                    </Tbody>
                                </Table>
                                <Grid container xs={12}>
                                    <Button variant="contained" size='small' color='success' sx={{ fontSize: 15, textTransform: 'none' }}>Valmis</Button>
                                    <Button onClick={() => { setEditData(order); setIsOpen(prevState => !prevState); }} variant="contained" size='small' sx={{ fontSize: 15, textTransform: 'none' }}>Muokkaa</Button>
                                    <Button variant="contained" size='small' color='error' sx={{ fontSize: 15, textTransform: 'none' }}>Poista</Button>
                                    <Button variant="contained" size='small' color='info' sx={{ fontSize: 15, textTransform: 'none' }}>Vie Exceliin</Button>
                                    <Button variant="contained" size='small' color='warning' sx={{ fontSize: 15, textTransform: 'none' }}>Tulosta taulukko</Button>
                                </Grid>
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <EditingMenu isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} editData={editData} setEditData={(value) => setEditData(value)} dataSaved={() => updateOrder()} />
        </ThemeProvider>
    )
}

export default Main